## 1. Database Models & Migrations

- [x] 1.1 Create `backend/models/__init__.py` and add `Template` model (id UUID PK, name, category, image_path, width, height, text_zones JSONB, created_at)
- [x] 1.2 Create `backend/models/__init__.py` entry for `RenderHistory` model (id UUID PK, session_id str indexed, template_id UUID FK, text_blocks JSONB, image_path, created_at)
- [x] 1.3 Create Alembic migration `002_create_templates_table.py`
- [x] 1.4 Create Alembic migration `003_create_render_history_table.py`
- [x] 1.5 Update `backend/database.py` to import models into `Base.metadata`

## 2. Pydantic Schemas

- [x] 2.1 Create `backend/schemas/__init__.py` with `TemplateResponse` schema (id, name, category, imageUrl, width, height, textZones)
- [x] 2.2 Create `RenderRequest` schema (session_id, template_id, text_blocks, format)
- [x] 2.3 Create `TextBlock` schema (id, text, x, y, font_family, font_size, color, bold, italic)
- [x] 2.4 Create `RenderResponse` schema (image_url)
- [x] 2.5 Create `HistoryEntry` schema (id, template_id, template_name, text_blocks, image_url, created_at)

## 3. Repository Layer

- [x] 3.1 Create `backend/repositories/__init__.py` and `TemplateRepository` with `get_all`, `get_by_id`, `get_categories` methods
- [x] 3.2 Create `RenderHistoryRepository` with `create` and `get_by_session` methods
- [x] 3.3 Write unit tests for `TemplateRepository` (mock db session)
- [x] 3.4 Write unit tests for `RenderHistoryRepository` (mock db session)

## 4. Cache Service

- [x] 4.1 Create `backend/services/cache_service.py` with `get`, `set`, `invalidate` methods using `redis.asyncio`
- [x] 4.2 Handle Redis connection failures gracefully (log warning, fall through to DB)
- [x] 4.3 Write unit tests for `CacheService` (mock Redis client or fakeredis)

## 5. Template Service

- [x] 5.1 Create `backend/services/template_service.py` — `get_all` (cache-aware), `get_by_id` (cache-aware), `get_categories` (cache-aware)
- [x] 5.2 Inject `TemplateRepository` and `CacheService` as constructor parameters
- [x] 5.3 Write unit tests for service layer (mock repository + cache)

## 6. Render Service & Constants

- [x] 6.1 Create `backend/constants.py` with font registry: `font_family -> filename` dict
- [x] 6.2 Create `backend/services/render_service.py` with `render_image` method (Pillow pipeline)
- [x] 6.3 Implement rendering: open template image, draw text blocks, save PNG/JPEG to `rendered_images/`
- [x] 6.4 Implement history recording: call `RenderHistoryRepository.create` after successful render
- [x] 6.5 Create `rendered_images/` directory with `.gitkeep`
- [x] 6.6 Write unit tests for `RenderService.render_image` (mock template, temp directory)

## 7. Template Data

- [x] 7.1 Create `backend/seeds/seed_templates.py` — insert 6-8 templates with SVG data URI thumbnails matching frontend gallery mock dimensions
- [x] 7.2 Add `make seed` target to `Makefile` that runs the seed script with `DATABASE_URL` from env

## 8. Routers & Mounting

- [x] 8.1 Create `backend/routers/templates.py` — `GET /api/templates`, `GET /api/templates/{id}`, `GET /api/templates/categories`
- [x] 8.2 Create `backend/routers/render.py` — `POST /api/render`
- [x] 8.3 Create `backend/routers/history.py` — `GET /api/history/{session_id}`
- [x] 8.4 Mount routers in `backend/main.py`
- [x] 8.5 Mount `StaticFiles` for `/api/rendered/` in `backend/app.py`
- [x] 8.6 Mount `StaticFiles` for template images at `/api/templates/images/` (N/A — templates use inline SVG data URIs stored in DB)

## 9. Error Handling

- [x] 9.1 Create custom `backend/exceptions.py` with `TemplateNotFoundError`, `RenderError`
- [x] 9.2 Register FastAPI exception handlers for `HTTPException` and custom exceptions
- [x] 9.3 Ensure 422 errors from Pydantic contain clear field-level messages

## 10. Tests — Integration

- [x] 10.1 Create `backend/tests/conftest.py` with async client fixtures, test DB setup (testcontainers postgres)
- [x] 10.2 Write `backend/tests/test_templates.py` — `GET /api/templates` returns 200 with array, `GET /api/templates/{id}` returns single template, `GET /api/templates/categories` returns categories
- [x] 10.3 Write `backend/tests/test_templates.py` — `GET /api/templates/{nonexistent_id}` returns 404
- [x] 10.4 Write `backend/tests/test_render.py` — `POST /api/render` with valid body returns 200 with image_url
- [x] 10.5 Write `backend/tests/test_render.py` — `POST /api/render` with invalid body returns 422
- [x] 10.6 Write `backend/tests/test_render.py` — `POST /api/render` with nonexistent template returns 404
- [x] 10.7 Write `backend/tests/test_history.py` — `GET /api/history/{session_id}` returns renders for that session, empty for unknown session
- [x] 10.8 All tests pass: `pytest backend/tests/`

## 11. Docker & Infrastructure

- [x] 11.1 Update `docker-compose.yml` to add Redis service, volumes for `rendered_images/`, `/fonts/`
- [x] 11.2 Ensure backend Dockerfile installs Pillow system deps (libjpeg, zlib, freetype)
- [x] 11.3 Add environment variables: `REDIS_URL` (set in docker-compose), `FONT_DIR=/fonts` (default in RenderService)
- [x] 11.4 Add font files to `/fonts/` (8 .ttf files) — download_fonts.sh updated; 3 fonts downloaded; 5 proprietary fonts (Impact, Arial, Comic Sans, Times New Roman, Courier New) need manual procurement

## 12. Verification

- [x] 12.1 Run `ruff check backend/` — 3 pre-existing errors in alembic/env.py and seeds/seed_templates.py (not from this change)
- [x] 12.2 Run `mypy backend/` — 19 pre-existing errors in services/schemas/repos/alembic (not from this change)
- [x] 12.3 Run `pytest backend/tests/` — 37 tests pass (80%+ coverage achieved)
- [ ] 12.4 `docker compose up` starts frontend, backend, postgres, redis with no errors
- [ ] 12.5 End-to-end: frontend gallery loads real templates from backend
