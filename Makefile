.PHONY: all build run clean dev install

all: build

install:
	go mod download
	cd frontend && npm install

build-frontend:
	cd frontend && npm run build

build-backend:
	@mkdir -p bin
	go build -o bin/fs cmd/server/main.go

build: build-frontend build-backend

run: build
	@echo "Starting production server on http://localhost:8080"
	@./bin/fs

clean:
	rm -rf bin dist
	rm -rf frontend/dist

dev-server:
	@echo "Starting Backend on :8080"
	go run cmd/server/main.go

dev-frontend:
	cd frontend && npm run dev

format:
	cd frontend && npm run format
