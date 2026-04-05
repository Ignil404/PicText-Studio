## Why

The frontend currently only has a counter demo App. Users need a template gallery to browse meme templates and a canvas editor to add, position, and style text overlays with export to PNG/JPEG. This is the primary user-facing feature of the project.

## What Changes

- Add `react-router-dom` and `html2canvas` dependencies to the frontend
- Scaffold React pages, components, hooks, services, and types for the template gallery and editor
- Implement client-side routing (`/` gallery, `/editor/:id` editor page)
- Implement template gallery with category filtering
- Implement canvas editor with draggable text overlay elements, text formatting toolbar, and image export
- Use mock data until backend template/render endpoints are implemented

## Capabilities

### New Capabilities
- `template-gallery`: Browse and filter meme templates by category, select one to edit
- `canvas-editor`: Add, position, style, and remove text elements on a template canvas with export to PNG/JPEG
- `frontend-routing`: Client-side navigation between gallery and editor pages

### Modified Capabilities
<!-- None - no existing specs -->

## Impact

- `frontend/src/` — nearly all files will be created or rewritten
- `frontend/package.json` — new dependencies
- `frontend/index.html` — updated title
- `backend/routers/` — no backend changes in this change (API stubs used)
- `docker-compose.yml` — frontend service already defined, no changes needed
