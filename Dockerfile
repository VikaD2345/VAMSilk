# Build the React interface.
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Build the Go API.
FROM golang:1.27-alpine AS backend
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 go build -o /vamsilk-api .

# One lightweight image serves both the API and the compiled web interface.
FROM alpine:3.21
RUN adduser -D -h /app appuser && mkdir /data && chown appuser:appuser /data
WORKDIR /app
COPY --from=backend /vamsilk-api ./vamsilk-api
COPY --from=frontend /frontend/dist ./public
USER appuser
ENV PORT=8080
ENV STATIC_DIR=/app/public
ENV DATABASE_PATH=/data/vamsilk.db
EXPOSE 8080
CMD ["./vamsilk-api"]
