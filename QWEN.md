# QWEN.md

This file provides guidance to Qwen Code when working with code in this repository.

## Project overview

- **Name**: DL2026_Spring_FSD2_Buslovich
- **Remote**: https://gitlab.12devs.com/training/internship/2026_dl_spring/ibuslovich/dl2026_spring_fsd2_buslovich
- **Status**: Backend API complete (merged). Frontend scaffold built but not yet wired to backend.
- **What it does**: Web app for creating text-overlay images — browse meme-style templates, add/edit text via a canvas editor, download rendered composites.

## Tech Stack
- Frontend: React 18 + Vite + TypeScript + React Router + HTML/CSS overlay editor + html2canvas
- Backend: FastAPI + Python 3.12 + Pillow (image rendering) + structlog
- DB: PostgreSQL + SQLAlchemy (async) + Alembic migrations
- Cache: Redis — `GET /api/templates` cached with TTL 600s
- Infra: Docker + docker-compose (mandatory, per CONSTITUTION.md)
- Canvas rendering: HTML/CSS divs overlay + html2canvas for export (MVP)
- Fonts: 8 bundled .ttf fonts, mapped by name in DB

## Development Commands
- `docker compose up` — start all services (postgres, redis, backend, frontend)
- `docker compose exec backend alembic upgrade head` — run migrations
- `docker compose exec backend python seeds/seed_templates.py` — seed 8 templates
- `docker compose exec backend pytest -v` — run backend tests
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
  src/pages/        — HomePage (gallery), EditorPage
  src/components/   — TemplateGallery, TemplateCard, Editor, Toolbar, TextLayer, ExportButton
  src/services/     — api.ts (currently uses mock data — fetch() commented out)
  src/hooks/        — useTemplates, useEditor
```

## Known Gaps
- Frontend uses mock data; `api.ts` has real `fetch()` calls commented out
- Template images are SVG data URIs, not real photos (render fails without real image files)
- 3 of 8 font .ttf files downloaded; 5 need manual procurement
- Zero frontend tests (37 backend only)
- No E2E test for the core user flow

## Workflow: OpenSpec

This project uses the `spec-driven` workflow via OpenSpec (`openspec/config.yaml`). When building features, use the OpenSpec skills:

- `opsx:propose` — propose a new change (design + specs + tasks generated in one step)
- `opsx:explore` — think through ideas and investigate problems before committing
- `opsx:apply` — implement tasks from an OpenSpec change
- `opsx:archive` — archive a completed change

OpenSpec specs live under `openspec/specs/` and archived changes under `openspec/changes/archive/`.

### Active Specs
- `render-history` — Session history retrieval and creation
- `server-render` — Image rendering via Pillow
- `template-management` — Template list, single fetch, categories, data model
- `canvas-editor` — Frontend canvas editing (frontend-only, no backend)
- `frontend-routing` — SPA routing with React Router
- `template-gallery` — Frontend gallery display (frontend-only, no backend)

## Key Decisions
- Server-side render via Pillow, not client-only export
- Session-based history (no auth in MVP)
- 8 fixed fonts in /fonts volume, synced client/server
- CORS wide open (`*`) for development
- Database credentials from env vars; alembic.ini uses placeholder