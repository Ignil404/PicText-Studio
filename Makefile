.PHONY: dev up down build clean test lint backend-install frontend-install

dev:
	docker compose up

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

clean:
	docker compose down -v --rmi local

test:
	docker compose exec backend pytest -v

lint:
	docker compose exec backend ruff check .
	docker compose exec backend mypy .

backend-install:
	cd backend && pip install -e ".[dev]"

frontend-install:
	cd frontend && npm install

format:
	docker compose exec backend ruff format .

# Install backend dependencies
install:
	cd backend && uv sync

# Run backend locally without Docker
# Requires: DATABASE_URL and REDIS_URL env vars, or running db via docker compose up -d postgres redis
run:
	cd backend && uv sync && uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

test-local:
	cd backend && uv run pytest -v

lint-local:
	cd backend && uv run ruff check .
	cd backend && uv run mypy .