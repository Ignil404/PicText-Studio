## Context

The backend is a minimal FastAPI scaffold (`backend/app.py`, `backend/main.py`, `backend/database.py`) with only a health endpoint. The frontend (React + Vite + TypeScript) is fully scaffolded with gallery, editor, hooks, and mock API calls. The TypeScript types define the API contract: templates as `{ id: string, name: string, category: string, imageUrl: string, width: number, height: number }`, render request as `{ template_id, text_elements, format }`, and render response as `{ image_url }`.

All new backend code must integrate with this existing contract. No changes to the frontend are needed — the `api.ts` endpoints already point to `/api/templates` and `/api/render`.

## Goals / Non-Goals

**Goals:**
- Serve real templates from Postgres that match the frontend's TypeScript types
- Server-side image rendering: overlay text onto templates via Pillow and return the rendered image
- Session-based render history (no authentication)
- Redis caching for template queries (TTL 600s)
- Clean layered architecture: routers → services → repositories → database

**Non-Goals:**
- User authentication/authorization
- Template creation/editing via API (templates are seeded once)
- Real-time rendering or WebSockets
- CDN for rendered images — local `rendered_images/` directory is sufficient for MVP
- Rate limiting (deferred)

## Decisions

### 1. Layered directory structure
**Decision:** `backend/models/`, `backend/repositories/`, `backend/services/`, `backend/schemas/`, `backend/routers/`

Each layer depends only on the layer below it. Models have SQLAlchemy async column/mapped_column definitions. Schemas are pure Pydantic v2 models. Repositories accept `AsyncSession` and return model instances. Services accept repositories and implement business logic (cache, rendering). Routers are thin — call services, handle HTTP concerns.

**Alternative:** Flat structure with everything in `routers/`. Rejected — the project has three distinct domains (templates, render, history) that will grow, so separation matters.

### 2. Template ID strategy
**Decision:** Templates use UUID primary keys (string type in DB). This matches the frontend's `Template.id: string` TypeScript type and the mock UUIDs in `TemplateCard.tsx`.

### 3. Text zones storage
**Decision:** `text_zones` stored as JSONB in the template model. Each zone is `{ id: string, x: number, y: number, font_family: string, font_size: int, color: string, width: int, height: int }`. This gives the frontend the layout hints for the overlay editor while letting Pillow use the same coordinates at render time.

### 4. Render image storage
**Decision:** Pillow renders to `backend/rendered_images/{uuid4()}.png`. The file URL is returned as `/api/rendered/{uuid4()}.png` via FastAPI's `StaticFiles`. No CDN or cloud storage in MVP.

### 5. Pillow rendering approach
**Decision:** Use `Image.open()` on the template image path, then `ImageDraw.Draw()` to draw text with `ImageFont.truetype()` for each text block. The font files are mounted in `/fonts/` volume on the container. For the Pillow render, we look up the font filename by the `font_family` name from the text element.

**Alternative:** SVG-based rendering. Rejected — Pillow is already chosen in `pyproject.toml` and `CONSTITUTION.md`, and is simpler text-draw-without-browser-dependencies.

### 6. Redis caching strategy
**Decision:** Use `redis.asyncio` client directly (not a library). Cache key format: `template:all` for full list, `template:{id}` for individual, `template:categories` for distinct categories. Cache stores JSON-serialized responses. `POST /api/render` invalidates `template:all` but not individual templates (templates themselves don't change in MVP).

**Alternative:** `aiocache` library. Rejected — direct `redis.asyncio` is simpler for this scope and the project already has Redis as a dependency. We only need `get`, `set`, and `delete` — `aiocache` would be over-abstraction.

### 7. Session ID generation
**Decision:** Client generates a UUIDv4, sends it in `POST /api/render` request body as `session_id`. History retrieval is `GET /api/history/{session_id}`. No session middleware needed — purely identifier-based.

**Alternative:** Server issues session IDs. Rejected — the frontend already generates `sessionId` in state (from the editor mock), and the TypeScript types don't show session management. Keeping it client-generated avoids an extra roundtrip.

### 8. Font resolution
**Decision:** A simple dictionary in `constants.py` maps font family names to font filenames: `{"Roboto": "Roboto-Regular.ttf", ...}`. All 8 fonts live at `/fonts/`. Pillow loads them via `ImageFont.truetype(f"/fonts/{filename}", size)`.

**Alternative:** Font scanning at startup. Rejected — 8 fixed fonts, a dict is clearer and has zero I/O overhead.

## Risks / Trade-offs

- **[Risk]** Pillow text rendering quality differs from browser `html2canvas` export → **Mitigation:** Document in README that client and server exports may have minor anti-aliasing differences; use same font files on both sides
- **[Risk]** `rendered_images/` grows unbounded without cleanup → **Mitigation:** Add a cron cleanup script or `shutil.rmtree` in a future iteration; acceptable for MVP with limited traffic
- **[Risk]** Redis connection failures crash API → **Mitigation:** Service layer catches Redis exceptions and falls back to direct DB reads (cache miss)
- **[Risk]** Text zones JSONB schema not enforced by database → **Mitigation:** Pydantic validation on read/write in schemas layer; DB-level CHECK constraints are overkill for MVP with seeded-only templates
- **[Trade-off]** Session-based history (no auth) means history is fragile — client loses its session ID, loses history. Accepted for MVP scope; auth can be added later with user-session mapping
