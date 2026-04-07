# Image Text Constructor

Internship project (DL2026 Spring FSD2). A web application for creating text-overlay images: browse template backgrounds, add text blocks via a canvas editor, and download the final rendered image.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: FastAPI + Python 3.12 + Pillow
- **Database**: PostgreSQL + SQLAlchemy (async) + Alembic
- **Cache**: Redis (template list, 600s TTL)
- **Infra**: Docker Compose

## Quick Start

```bash
cp .env.example .env
docker compose up
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

## Features

- Browse templates by category on the gallery page
- Add, edit, and position text blocks on the canvas editor
- Export via server-side Pillow render (html2canvas fallback if backend unreachable)
- View session render history at `/history`
- Session ID persisted in localStorage — no login required

## Development Commands

| Command | Description |
|---|---|
| `make dev` | Start all services |
| `make down` | Stop all services |
| `make lint` | Run ruff + mypy |
| `make format` | Auto-format backend |
| `make test` | Run pytest |
| `make build` | Build Docker images |

## Architecture

```
┌─────────────┐         ┌──────────────────┐
│  Frontend   │         │     Backend      │
│  React SPA  │◄──REST──│   FastAPI +      │
│  html2canvas│         │   Pillow Render  │
│  (fallback) │         │                  │
└─────────────┘         │ ┌────┐  ┌──────┐ │
     │                  │ │ PG │  │Redis │ │
     │   Pillow render  │ └────┘  └──────┘ │
     └──────────────────┴──────────────────┘
                        ▲
     Session history ───┘
```

## Project Structure

```
├── backend/                  # FastAPI application
│   ├── routers/              # HTTP endpoints
│   ├── services/             # Business logic
│   ├── repositories/         # Data access (generic base)
│   ├── schemas/              # Pydantic models
│   ├── alembic/              # DB migrations
│   ├── tests/                # pytest tests (37 passing)
│   └── pyproject.toml        # Dependencies + tool config
├── frontend/                 # React + Vite + TypeScript
│   ├── src/pages/            # HomePage, EditorPage, HistoryPage
│   ├── src/components/       # Gallery, Editor, ExportButton, HistoryCard
│   ├── src/services/         # API client (real backend)
│   ├── src/hooks/            # useTemplates, useEditor, useHistory
│   └── src/lib/              # session.ts (localStorage UUID)
├── fonts/                    # 8 bundled .ttf files
├── docker-compose.yml        # 4 services: postgres, redis, backend, frontend
├── Makefile                  # Convenience targets
└── CONSTITUTION.md           # Project principles
```

## Principles

See [CONSTITUTION.md](CONSTITUTION.md):

- Docker-first deployment
- PostgreSQL for persistent data, Redis for cache only
- Clean frontend/backend separation
- Single Responsibility Principle
- Code quality: ruff + mypy + pytest
