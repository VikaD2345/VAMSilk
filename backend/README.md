# VAMSilk backend (Go)

Небольшой REST API для мессенджера. Он хранит пользователей и личные сообщения в SQLite.

## Запуск

1. Установить Go 1.22 или новее: https://go.dev/dl/
2. Открыть терминал в папке `backend`.
3. Выполнить:

```bash
go mod tidy
go run .
```

Сервер будет доступен по `http://localhost:8080`, а файл базы `vamsilk.db` появится в папке `backend`.

Перед публикацией обязательно задайте свой секрет:

```powershell
$env:JWT_SECRET = "длинный-случайный-секрет"
go run .
```

## Таблицы

- `users`: `id`, уникальный `username`, `display_name`, `password_hash`, дата создания.
- `messages`: отправитель, получатель, текст и дата. Внешние ключи ссылаются на `users`.

Пароли никогда не сохраняются открытым текстом: используется `bcrypt`-хеш. После входа сервер выдаёт JWT на 24 часа. Его нужно передавать в защищённые запросы: `Authorization: Bearer <token>`.

## Методы API

| Метод | Адрес | Назначение |
| --- | --- | --- |
| POST | `/api/auth/register` | Регистрация: `username`, `displayName`, `password` |
| POST | `/api/auth/login` | Вход: `username`, `password` |
| GET | `/api/me` | Текущий пользователь |
| GET | `/api/users` | Список пользователей |
| GET | `/api/messages?with=2` | Диалог с пользователем №2 |
| POST | `/api/messages` | Отправить: `recipientId`, `text` |

Пример регистрации:

```powershell
Invoke-RestMethod -Method Post http://localhost:8080/api/auth/register -ContentType 'application/json' -Body '{"username":"vika","displayName":"Вика","password":"secret67"}'
```

### Что легко рассказать на защите

1. React отвечает за экран, Go — за правила и данные.
2. При регистрации Go проверяет поля, хеширует пароль и добавляет пользователя в SQLite.
3. При входе Go сравнивает хеш и выдаёт JWT; без него сообщения читать или отправлять нельзя.
4. SQLite — файл без отдельного сервера, поэтому удобен для учебного проекта. Позже его можно заменить на PostgreSQL, не меняя HTTP-маршруты.
