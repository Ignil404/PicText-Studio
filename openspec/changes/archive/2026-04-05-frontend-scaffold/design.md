## Context

The frontend is currently a bare Vite + React + TypeScript scaffold with a counter demo App. The project constitution mandates frontend/backend separation, Docker-first development, and CSS-first approach. The backend exposes REST API endpoints that the frontend will consume, but backend template/render endpoints are not yet implemented.

## Goals / Non-Goals

**Goals:**
- Scaffold React pages, components, hooks, services, and TypeScript types for the template gallery and canvas editor
- Enable client-side routing between gallery and editor pages
- Implement template browsing with category filtering
- Implement canvas editor with draggable text overlays, formatting toolbar, and image export via html2canvas
- Use mock data initially with clearly-marked swap points for real API calls

**Non-Goals:**
- Backend API implementation (separate change)
- User authentication or accounts
- Template upload or creation
- Undo/redo history
- Touch/mobile gesture support for dragging
- Persistence of editor state across sessions

## Decisions

### CSS Modules over Tailwind
CSS Modules provide component-scoped styles with standard CSS. For the editor's precise canvas layout and overlay positioning, custom CSS with percentage-based positioning is simpler than Tailwind utility composition.

### `html2canvas` for export, with backend fallback path
`html2canvas` rasterizes the DOM to produce images client-side, providing immediate MVP value. When the backend Pillow rendering endpoint is ready, the export flow will call the server endpoint first and fall back to `html2canvas` only when the server is unavailable.

### Positions stored as percentages
Text element `x` and `y` coordinates are stored as CSS percentages (0-100) rather than absolute pixels. This ensures text overlays maintain correct relative position regardless of canvas viewport resize or export resolution.

### No global state manager
For two routes and a single editor surface, hoisted state via `useEditor` hook with prop drilling is sufficient. No Zustand, Redux, or Context API is needed — this avoids unnecessary abstraction at MVP stage.

### Custom CSS-only drag implementation
Instead of `react-draggable` or `dnd-kit`, implement `onMouseDown`/`onMouseMove`/`onMouseUp` drag directly in `TextLayer`. This avoids adding a dependency for a simple interaction. Position updates throttle via `requestAnimationFrame`.

### Mock data in API service layer
Mock template data lives in `src/services/api.ts` behind a function that returns `Promise<Template[]>`. The real `fetch` call is commented out with a one-line swap point. This keeps the interface identical regardless of data source.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `html2canvas` with cross-origin images (mock URLs may taint canvas) | Include a local test image in `frontend/public/` for reliable export during dev |
| Drag handler fires at 60+ Hz causing jank | Use `requestAnimationFrame` to batch position updates |
| TypeScript strictness (`noUnusedLocals`, `noUnusedParameters`) may slow scaffolding | Create all imports before writing component bodies so nothing is unused |
| SPA routing breaks on nginx with direct `/editor/:id` links | Update nginx config to serve `index.html` for all routes (not part of this scaffold, but needed before production) |
| Font availability mismatch between client display and server Pillow render | Frontend shows available system fonts; final export uses server-side bundled fonts (8 known .ttf files) |
