FROM node:20-alpine AS builder

RUN apk add --no-cache go

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm install

COPY . .

RUN cd frontend && npm run build
RUN mkdir -p bin && go build -o bin/fs cmd/server/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/bin/fs ./bin/fs
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["./bin/fs"]
