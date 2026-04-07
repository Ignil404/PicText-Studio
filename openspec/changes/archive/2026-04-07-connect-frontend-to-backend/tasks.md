## 1. Session Management

- [x] 1.1 Create `frontend/src/lib/session.ts` with `getSessionId()` utility (generates `crypto.randomUUID()`, persists in `localStorage`, returns existing value on subsequent calls)
- [x] 1.2 Add unit tests for `getSessionId()` — first visit, returning visit, localStorage unavailable edge case

## 2. API Layer — Replace Mock with Real Fetch

- [x] 2.1 Update `frontend/src/services/api.ts` — replace mock `fetchTemplates()` with real `fetch(`${API_BASE}/templates`)` call
- [x] 2.2 Add `fetchHistory(sessionId: string)` function in `api.ts` calling `GET /api/history/{session_id}`
- [x] 2.3 Update `renderImage()` in `api.ts` to include `session_id` from `getSessionId()` in the request body
- [x] 2.4 Remove commented-out mock code and `svgPlaceholder` helper from `api.ts`

## 3. useTemplates Hook — Remove Mock, Wire Real API

- [x] 3.1 Verify `useTemplates` already handles loading/error states from `fetchTemplates()` (already does — confirm with read)
- [x] 3.2 Test gallery loads real templates when backend is running
- [x] 3.3 Test gallery shows error state when backend is unreachable

## 4. useEditor Hook — Server Render with Fallback

- [x] 4.1 Update `exportCanvas()` in `useEditor` to first attempt `POST /api/render` via `renderImage()` with `template_id`, `text_blocks`, `format`, and `session_id`
- [x] 4.2 Add `textBlocks` parameter to `exportCanvas()` signature (convert from `textElements` at call site)
- [x] 4.3 On network error (unreachable backend), fall back to existing `html2canvas` flow
- [x] 4.4 On backend error response (e.g., 422), throw error with `detail` message — no fallback
- [x] 4.5 Update `RenderRequest` type in `frontend/src/types/index.ts` to include `session_id: string`

## 5. ExportButton — Pass Template ID and Text Elements

- [x] 5.1 Update `ExportButton` component to receive `templateId` and `textElements` as props
- [x] 5.2 Wire `exportCanvas` call to include the full render request (template_id, text_blocks, format, session_id)
- [x] 5.3 Add loading state (disable button, show spinner) during server render
- [x] 5.4 Add error display (toast or inline message) when render fails without fallback

## 6. History Page

- [x] 6.1 Create `frontend/src/hooks/useHistory.ts` hook — fetches from `GET /api/history/{session_id}`, returns `{ entries, loading, error }`
- [x] 6.2 Create `frontend/src/pages/HistoryPage.tsx` with loading spinner, error state with retry, empty state, and history card grid
- [x] 6.3 Create `frontend/src/components/HistoryCard/index.tsx` component — displays thumbnail, template name, timestamp, click-to-re-edit
- [x] 6.4 Add `TextElement` type mapping from API response (`text_blocks`) to frontend `TextElement` for re-edit flow

## 7. Routing

- [x] 7.1 Add `/history` route to `frontend/src/App.tsx` rendering `HistoryPage`
- [x] 7.2 Add navigation link to history page in the app header or toolbar
- [x] 7.3 Verify all routes (`/`, `/editor/:id`, `/history`) work with navigation

## 8. Integration Testing & Polish

- [x] 8.1 Run full dev flow: `docker compose up`, visit `/`, select template, edit text, export, view in `/history`
- [x] 8.2 Verify html2canvas fallback triggers when backend is stopped mid-session
- [x] 8.3 Verify session_id persists across page reloads
- [x] 8.4 Run `npm run lint` and `npm run tsc` — fix all issues
- [x] 8.5 Run backend tests — ensure render and history endpoints pass with session_id
