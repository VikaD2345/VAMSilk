// VAMSilk API is a small educational backend for the VAMSilk messenger.
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

type server struct {
	db        *sql.DB
	jwtSecret []byte
}

type user struct {
	ID          int64  `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	CreatedAt   string `json:"createdAt"`
}

type message struct {
	ID          int64  `json:"id"`
	SenderID    int64  `json:"senderId"`
	RecipientID int64  `json:"recipientId"`
	Text        string `json:"text"`
	CreatedAt   string `json:"createdAt"`
}

func main() {
	path := env("DATABASE_PATH", "vamsilk.db")
	db, err := sql.Open("sqlite", path)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	if err := createTables(db); err != nil {
		log.Fatal(err)
	}

	secret := []byte(env("JWT_SECRET", "change-this-secret-before-production"))
	s := &server{db: db, jwtSecret: secret}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", s.health)
	mux.HandleFunc("POST /api/auth/register", s.register)
	mux.HandleFunc("POST /api/auth/login", s.login)
	mux.HandleFunc("GET /api/me", s.auth(s.me))
	mux.HandleFunc("GET /api/users", s.auth(s.users))
	mux.HandleFunc("GET /api/messages", s.auth(s.messages))
	mux.HandleFunc("POST /api/messages", s.auth(s.sendMessage))

	addr := env("PORT", "8080")
	log.Printf("VAMSilk API runs on http://localhost:%s", addr)
	log.Fatal(http.ListenAndServe(":"+addr, cors(mux)))
}

func createTables(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE COLLATE NOCASE,
			display_name TEXT NOT NULL,
			password_hash TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender_id INTEGER NOT NULL REFERENCES users(id),
			recipient_id INTEGER NOT NULL REFERENCES users(id),
			text TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_messages_dialog ON messages(sender_id, recipient_id, created_at);
	`)
	return err
}

// health is used to quickly verify that the API process is alive.
func (s *server) health(w http.ResponseWriter, r *http.Request) {
	if err := s.db.Ping(); err != nil {
		fail(w, http.StatusServiceUnavailable, "База данных недоступна.")
		return
	}
	respond(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *server) register(w http.ResponseWriter, r *http.Request) {
	var input struct{ Username, DisplayName, Password string }
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Username, input.DisplayName = strings.TrimSpace(input.Username), strings.TrimSpace(input.DisplayName)
	if len(input.Username) < 2 || len(input.DisplayName) < 1 || len(input.Password) < 6 {
		fail(w, http.StatusBadRequest, "Логин — от 2 символов, пароль — от 6 символов.")
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		fail(w, 500, "Не удалось защитить пароль.")
		return
	}
	result, err := s.db.Exec(`INSERT INTO users (username, display_name, password_hash) VALUES (?, ?, ?)`, input.Username, input.DisplayName, string(hash))
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			fail(w, 409, "Этот логин уже занят.")
			return
		}
		fail(w, 500, "Не удалось создать пользователя.")
		return
	}
	id, _ := result.LastInsertId()
	s.replyWithToken(w, user{ID: id, Username: input.Username, DisplayName: input.DisplayName, CreatedAt: time.Now().UTC().Format(time.RFC3339)})
}

func (s *server) login(w http.ResponseWriter, r *http.Request) {
	var input struct{ Username, Password string }
	if !decodeJSON(w, r, &input) {
		return
	}
	var u user
	var hash string
	err := s.db.QueryRow(`SELECT id, username, display_name, password_hash, created_at FROM users WHERE username = ?`, strings.TrimSpace(input.Username)).Scan(&u.ID, &u.Username, &u.DisplayName, &hash, &u.CreatedAt)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(input.Password)) != nil {
		fail(w, http.StatusUnauthorized, "Неверный логин или пароль.")
		return
	}
	s.replyWithToken(w, u)
}

func (s *server) replyWithToken(w http.ResponseWriter, u user) {
	token, err := s.makeToken(u.ID)
	if err != nil {
		fail(w, 500, "Не удалось выдать токен.")
		return
	}
	respond(w, http.StatusCreated, map[string]any{"user": u, "token": token})
}

func (s *server) me(w http.ResponseWriter, r *http.Request) {
	u, err := s.currentUser(r)
	if err != nil {
		fail(w, 401, "Требуется вход.")
		return
	}
	respond(w, 200, u)
}

func (s *server) users(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.Query(`SELECT id, username, display_name, created_at FROM users ORDER BY username`)
	if err != nil {
		fail(w, 500, "Не удалось получить пользователей.")
		return
	}
	defer rows.Close()
	list := []user{}
	for rows.Next() {
		var u user
		if rows.Scan(&u.ID, &u.Username, &u.DisplayName, &u.CreatedAt) == nil {
			list = append(list, u)
		}
	}
	respond(w, 200, list)
}

func (s *server) messages(w http.ResponseWriter, r *http.Request) {
	me, err := s.currentUser(r)
	if err != nil {
		fail(w, 401, "Требуется вход.")
		return
	}
	otherID, err := strconv.ParseInt(r.URL.Query().Get("with"), 10, 64)
	if err != nil || otherID < 1 {
		fail(w, 400, "Укажите id собеседника: ?with=2")
		return
	}
	rows, err := s.db.Query(`SELECT id, sender_id, recipient_id, text, created_at FROM messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) ORDER BY created_at, id`, me.ID, otherID, otherID, me.ID)
	if err != nil {
		fail(w, 500, "Не удалось получить сообщения.")
		return
	}
	defer rows.Close()
	list := []message{}
	for rows.Next() {
		var m message
		if rows.Scan(&m.ID, &m.SenderID, &m.RecipientID, &m.Text, &m.CreatedAt) == nil {
			list = append(list, m)
		}
	}
	respond(w, 200, list)
}

func (s *server) sendMessage(w http.ResponseWriter, r *http.Request) {
	me, err := s.currentUser(r)
	if err != nil {
		fail(w, 401, "Требуется вход.")
		return
	}
	var input struct {
		RecipientID int64  `json:"recipientId"`
		Text        string `json:"text"`
	}
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Text = strings.TrimSpace(input.Text)
	if input.RecipientID < 1 || input.Text == "" || len([]rune(input.Text)) > 2000 {
		fail(w, 400, "Сообщение должно содержать от 1 до 2000 символов.")
		return
	}
	var exists bool
	if s.db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)`, input.RecipientID).Scan(&exists) != nil || !exists {
		fail(w, 404, "Получатель не найден.")
		return
	}
	result, err := s.db.Exec(`INSERT INTO messages (sender_id, recipient_id, text) VALUES (?, ?, ?)`, me.ID, input.RecipientID, input.Text)
	if err != nil {
		fail(w, 500, "Не удалось сохранить сообщение.")
		return
	}
	id, _ := result.LastInsertId()
	respond(w, http.StatusCreated, message{ID: id, SenderID: me.ID, RecipientID: input.RecipientID, Text: input.Text, CreatedAt: time.Now().UTC().Format(time.RFC3339)})
}

func (s *server) auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if _, err := s.currentUser(r); err != nil {
			fail(w, 401, "Требуется вход.")
			return
		}
		next(w, r)
	}
}
func (s *server) currentUser(r *http.Request) (user, error) {
	header := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	id, err := s.verifyToken(header)
	if err != nil {
		return user{}, err
	}
	var u user
	err = s.db.QueryRow(`SELECT id, username, display_name, created_at FROM users WHERE id = ?`, id).Scan(&u.ID, &u.Username, &u.DisplayName, &u.CreatedAt)
	return u, err
}

// Tokens are standard HMAC-SHA256 JWTs. Keeping this code here makes its logic easy to explain at a defense.
func (s *server) makeToken(userID int64) (string, error) {
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
	payload, err := json.Marshal(map[string]any{"sub": userID, "exp": time.Now().Add(24 * time.Hour).Unix()})
	if err != nil {
		return "", err
	}
	body := header + "." + base64.RawURLEncoding.EncodeToString(payload)
	mac := hmac.New(sha256.New, s.jwtSecret)
	mac.Write([]byte(body))
	return body + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil)), nil
}
func (s *server) verifyToken(token string) (int64, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return 0, errors.New("bad token")
	}
	mac := hmac.New(sha256.New, s.jwtSecret)
	mac.Write([]byte(parts[0] + "." + parts[1]))
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil || !hmac.Equal(signature, mac.Sum(nil)) {
		return 0, errors.New("bad signature")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return 0, err
	}
	var claims struct {
		Subject int64 `json:"sub"`
		Expires int64 `json:"exp"`
	}
	if json.Unmarshal(payload, &claims) != nil || claims.Expires < time.Now().Unix() {
		return 0, errors.New("expired")
	}
	return claims.Subject, nil
}

func decodeJSON(w http.ResponseWriter, r *http.Request, value any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	if json.NewDecoder(r.Body).Decode(value) != nil {
		fail(w, 400, "Некорректный JSON.")
		return false
	}
	return true
}
func respond(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(value)
}
func fail(w http.ResponseWriter, status int, text string) {
	respond(w, status, map[string]string{"error": text})
}
func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://127.0.0.1:5173")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
