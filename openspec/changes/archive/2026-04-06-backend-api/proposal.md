## Why

The frontend scaffold (TemplateGallery, Editor, hooks, routing, export UI) is complete and points to mock API responses. This proposal adds the full backend API — templates database, server-side rendering via Pillow, session-based render history, and Redis caching — so the frontend can talk to the real service and all smoke tests pass end to end.

## What Changes

- **Database models** — `Template` and `RenderHistory` tables with Alembic migrations
- **API endpoints** — five new routes under `/api/` for templates, rendering, and history
- **Repository layer** — `TemplateRepository` (CRUD) and `RenderHistoryRepository` (create, get_by_session)
- **Service layer** — `TemplateService` (get_all, get_by_id, get_categories), `RenderService` (render_image via Pillow, save_history), `CacheService` (get/set/invalidate via Redis)
- **Pydantic schemas** — request/response validation for all endpoints
- **Seed script** — 6-8 template records with images matching the frontend mock
- **Redis caching** — TTL 600s on `GET /api/templates` and `GET /api/templates/:id`
- **Static file serving** — serve rendered images from `rendered_images/`
- **Tests** — endpoint tests for templates CRUD and render pipeline

## Capabilities

### New Capabilities
- `template-management`: List, filter by category, and fetch individual templates with database-backed CRUD
- `server-render`: Server-side image rendering via Pillow — overlay text blocks onto template images and return the result
- `render-history`: Session-based history — store and retrieve past renders per session ID
- `template-seed`: Initial data seeding — 6-8 templates with matching images for the frontend gallery
- `cache-layer`: Redis caching for template queries with 600s TTL

### Modified Capabilities
- _(none — all new capabilities)_

## Impact

- New: `backend/models/`, `backend/schemas/`, `backend/services/`, `backend/repositories/`, `backend/routers/`
- New: `backend/alembic/versions/002_create_templates_table.py`, `003_create_render_history_table.py`
- New: `backend/seeds/seed_templates.py`
- New: `backend/rendered_images/` (static files directory)
- Updated: `backend/main.py` — mount additional routers
- Updated: `backend/app.py` — add static file mount
- Dependencies: Redis client already in `pyproject.toml`
- Frontend: `frontend/src/services/api.ts` endpoints already match the proposed contract — no frontend changes needed
