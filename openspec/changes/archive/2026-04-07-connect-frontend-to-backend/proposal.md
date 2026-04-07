## Why

The frontend currently relies on mock data in `services/api.ts` and client-only `html2canvas` export. The backend already exposes real endpoints (`GET /api/templates`, `POST /api/render`, `GET /api/history/{session_id}`) with Pillow-based server rendering and a render history service. Connecting the two turns the prototype into a functional application with server-side rendering, shared template data, and session-based history.

## What Changes

- **`services/api.ts`**: Replace mock template data with real `fetch` calls to `GET /api/templates` and `GET /api/templates/:id`
- **Session management**: Generate `session_id` via `crypto.randomUUID()` on the client, persist in `localStorage`, send with render and history requests
- **`useTemplates` hook**: Remove mock fallback, wire to real `api.ts` calls with loading/error states
- **`useEditor` hook**: On export, call `POST /api/render` (server-side Pillow render) instead of `html2canvas`; keep `html2canvas` as a fallback when the backend is unreachable
- **History page**: New `/history` route showing past renders for the current session
- **Error handling**: Add loading and error states to template gallery, editor, and history views
- **Vite proxy**: Confirm `/api` proxy in `vite.config.ts` already routes to `localhost:8000` (already configured — no change needed)

## Capabilities

### New Capabilities
- `session-management`: Client-side session ID generation, persistence in localStorage, and inclusion in API requests for render and history
- `render-history-ui`: History page (`/history`) displaying past session renders with thumbnails and metadata
- `api-integration`: Replace mock data in api.ts with real fetch calls, add error/loading states across components

### Modified Capabilities
- `canvas-editor`: Export flow changes — primary path becomes server-side `POST /api/render` with `html2canvas` as fallback (requirement change: export is no longer purely client-side)
- `template-gallery`: Templates now sourced from backend API instead of mock data (requirement change: gallery depends on live backend availability)
- `server-render`: The render endpoint now receives `session_id` from the client for history tracking (new request field)

## Impact

- **Updated**: `frontend/src/services/api.ts` — real fetch calls, session_id injection
- **Updated**: `frontend/src/hooks/useTemplates.ts` — remove mock, add loading/error states
- **Updated**: `frontend/src/hooks/useEditor.ts` — server-render first, html2canvas fallback
- **New**: `frontend/src/pages/HistoryPage.tsx` — session history display
- **Updated**: `frontend/src/App.tsx` — add `/history` route
- **Updated**: `backend/schemas.py` — add `session_id` to `RenderRequest`
- **Updated**: `backend/services/render_service.py` — store session_id in history records
- **New**: frontend components for history list, error boundaries, loading spinners
- **No new dependencies** on the frontend; backend already has all required services
