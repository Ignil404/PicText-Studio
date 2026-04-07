## Context

The frontend is a React 18 + TypeScript SPA served via Vite dev server (port 3000), proxying `/api` to the FastAPI backend (port 8000). The backend already implements all required endpoints: `GET /api/templates`, `GET /api/templates/:id`, `POST /api/render`, `GET /api/history/:session_id`. The frontend currently uses mock data in `api.ts` and `html2canvas` for export. The backend's `RenderRequest` schema already includes `session_id` and the render service stores history records keyed by session.

The gap is purely on the frontend: no real API calls, no session management, no history page.

## Goals / Non-Goals

**Goals:**
- Connect frontend to real backend API for templates, rendering, and history
- Establish session-based identity via `localStorage`-persisted UUID
- Replace client-only `html2canvas` export with server-side Pillow rendering
- Add `/history` page for session render history
- Add loading/error states across all data-fetching components

**Non-Goals:**
- No authentication or user accounts (session-only MVP)
- No cross-session history sharing
- No offline mode or local-first rendering
- No changes to the backend rendering pipeline or Pillow logic
- No real-time sync or WebSocket connections

## Decisions

### 1. Session ID: client-generated, localStorage-persisted
**Decision:** Generate `crypto.randomUUID()` on first visit, store in `localStorage` under `session_id`.
**Rationale:** The backend already expects `session_id` in render requests. Client-side generation avoids a round-trip and works with the existing API contract. No server-side session endpoint needed.
**Alternatives considered:**
- Server-issued sessions: would require a new `POST /api/sessions` endpoint — unnecessary complexity for MVP.
- Cookie-based sessions: overkill without auth; adds CORS complexity.

### 2. Export: server-render first, html2canvas fallback
**Decision:** `exportCanvas` in `useEditor` calls `POST /api/render` as primary path. On failure (network error, backend down), falls back to existing `html2canvas` flow.
**Rationale:** Server-side Pillow rendering gives better font quality and consistent output. The fallback ensures the editor remains functional during backend downtime.
**Alternatives considered:**
- Server-render only: breaks dev experience when backend isn't running.
- html2canvas only: defeats the purpose of building the backend render pipeline.

### 3. API layer: augment, don't replace, existing api.ts
**Decision:** Keep `renderImage()` and `cancelRender()` as-is (they already call the real endpoint). Replace mock `fetchTemplates()` with real `fetch`. Add new functions: `fetchHistory(sessionId)`.
**Rationale:** The render function is already wired correctly. Minimal changes reduce regression risk.

### 4. History page: standalone route with shared component patterns
**Decision:** Create `/history` route with `HistoryPage.tsx`. Reuse the same fetch/error/loading pattern from `useTemplates` via a new `useHistory` hook.
**Rationale:** Consistent patterns across data-fetching pages. A dedicated hook keeps concerns separated and testable.

### 5. Error handling: per-component, no global error boundary (MVP)
**Decision:** Each component (gallery, editor, history) manages its own loading/error state via hook return values. No global error boundary or toast system yet.
**Rationale:** Keep it simple for MVP. Each component already has the pattern; just wire it through.

### 6. Template data contract: backend `imageUrl` maps to backend `image_path`
**Decision:** The backend `TemplateResponse` returns `imageUrl` as `template.image_path` (a filesystem path). The frontend displays it as `<img src="/api/templates/images/{uuid}.jpg">` — the proxy handles it.
**Rationale:** The Vite proxy forwards `/api` to the backend. The backend mounts `/api/templates/images` as a static file route (or serves from `/api/rendered` for rendered images). The frontend doesn't need to know the storage details.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend unavailable during frontend dev | html2canvas fallback covers export; template gallery shows error state | Fallback path tested; clear error messages |
| `session_id` collision (extremely unlikely with UUID4) | History records mixed | Negligible probability; acceptable for MVP |
| html2canvas fallback produces different output than server render | User sees inconsistent results | Clearly label fallback output; primary path is server render |
| No pagination for history (assumes <100 renders/session) | Performance degrades with heavy use | Add pagination in future iteration |
| Font mismatch between frontend preview and backend render | Visual discrepancy in exported image | Frontend uses same font-family names; backend resolves via FONT_REGISTRY |
