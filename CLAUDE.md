# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

- **Name**: DL2026_Spring_FSD2_Buslovich
- **Remote**: https://gitlab.12devs.com/training/internship/2026_dl_spring/ibuslovich/dl2026_spring_fsd2_buslovich
- **Status**: MVP complete — frontend connected to backend, server-side render, session history
- **What it does**: Web app for creating text-overlay images — browse meme-style templates, add/edit text via a canvas editor, download rendered composites, view session render history

## Tech Stack
- Frontend: React 18 + Vite + TypeScript + React Router + HTML/CSS overlay editor + html2canvas + vitest
- Backend: FastAPI + Python 3.12 + Pillow (image rendering) + structlog
- DB: PostgreSQL + SQLAlchemy (async) + Alembic migrations
- Cache: Redis — `GET /api/templates` cached with TTL 600s
- Infra: Docker + docker-compose (mandatory, per CONSTITUTION.md)
- Canvas rendering: Server-side Pillow render with client-side html2canvas fallback
- Fonts: 8 bundled .ttf fonts, mapped by name in DB
- Session: client-side UUID v4 persisted in localStorage

## Development Commands
- `docker compose up` — start all services (postgres, redis, backend, frontend)
- `docker compose exec backend alembic upgrade head` — run migrations
- `docker compose exec backend python seeds/seed_templates.py` — seed 8 templates
- `docker compose exec backend pytest -v` — run backend tests
- `cd frontend && npm test` — run frontend tests (vitest)
- `cd backend && python3 -m ruff check .` — lint
- `cd backend && python3 -m mypy .` — type check (from backend/ dir for pyproject.toml)
- `make lint` / `make test` — Makefile targets

## API Endpoints
- `GET /` — API landing page
- `GET /docs` — Swagger UI
- `GET /api/health` — health check (postgres, redis)
- `GET /api/templates/` — list all templates (cached)
- `GET /api/templates/{id}` — single template
- `GET /api/templates/categories` — distinct categories
- `POST /api/render` — render image with text blocks
- `GET /api/history/{session_id}` — session render history

## Project Structure
```
backend/
  alembic/          — DB migrations (001 users, 002 templates, 003 render_history)
  models/           — SQLAlchemy models (Template, RenderHistory)
  schemas/          — Pydantic request/response models
  repositories/     — Data access layer (TemplateRepository, RenderHistoryRepository)
  services/         — Business logic (TemplateService, RenderService, CacheService)
  routers/          — FastAPI routers (health, templates, render, history)
  seeds/            — seed_templates.py (8 templates with SVG placeholders)
  tests/            — 37 tests across all layers
frontend/
  src/pages/        — HomePage (gallery), EditorPage, HistoryPage
  src/components/   — TemplateGallery, TemplateCard, Editor, Toolbar, TextLayer, ExportButton, HistoryCard
  src/services/     — api.ts (real fetch() calls to backend, RenderError class)
  src/hooks/        — useTemplates, useEditor, useHistory
  src/lib/          — session.ts (UUID v4, localStorage persistence)
  vitest.config.ts  — frontend test config
```

## Known Gaps
- Template images are SVG data URIs, not real photos (render works but placeholders aren't production images)
- 3 of 8 font .ttf files downloaded; 5 need manual procurement
- Minimal frontend test coverage (3 session tests; component tests needed)
- No E2E test for the core user flow

## Workflow: OpenSpec

This project uses the `spec-driven` workflow via OpenSpec (`openspec/config.yaml`). When building features, use the OpenSpec skills:

- `opsx:propose` — propose a new change (design + specs + tasks generated in one step)
- `opsx:explore` — think through ideas and investigate problems before committing
- `opsx:apply` — implement tasks from an OpenSpec change
- `opsx:archive` — archive a completed change

OpenSpec specs live under `openspec/specs/` and archived changes under `openspec/changes/archive/`.

### Completed Changes
- `connect-frontend-to-backend` — Real API integration, server-side render with fallback, session history

### Archived Specs
- `render-history` — Session history retrieval and creation
- `server-render` — Image rendering via Pillow
- `template-management` — Template list, single fetch, categories, data model
- `canvas-editor` — Frontend canvas editing
- `frontend-routing` — SPA routing with React Router
- `template-gallery` — Frontend gallery display
- `api-integration` — Frontend↔backend API calls
- `session-management` — Client-side session ID
- `render-history-ui` — History page and cards

## Key Decisions
- Server-side render via Pillow, not client-only export
- Session-based history (no auth in MVP)
- 8 fixed fonts in /fonts volume, synced client/server
- CORS wide open (`*`) for development
- Database credentials from env vars; alembic.ini uses placeholder