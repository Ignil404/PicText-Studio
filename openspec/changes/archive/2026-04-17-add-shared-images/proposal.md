## Why

Users currently cannot share their rendered templates with others. After creating a design in the editor and exporting it, they can only download the image locally. Adding shared images allows users to generate a public link to their rendered designs, enabling easy sharing via URL without requiring authentication.

## What Changes

- **New API endpoint**: `POST /api/shared` — creates a shareable link for a render
- **New API endpoint**: `GET /api/shared/:shareId` — retrieves a render by its public share ID
- **New database table**: `shared_images` — stores share metadata (UUID, render_history FK, unique share_id, created_at)
- **New frontend page**: `/shared/:id` — public page to view a shared render
- **New UI component**: "Share" button in the editor after export
- **New capability**: `shared-images` — public access to shared renders without auth

## Capabilities

### New Capabilities

- `shared-images`: Public sharing of rendered templates via unique URLs. Allows unauthenticated users to view shared renders by ID.

### Modified Capabilities

- `render-history`: No requirement changes — implementation detail for the shared_images table to reference render_history.
- `server-render`: No requirement changes — existing export flow remains unchanged.

## Impact

- **Backend**: New table `shared_images`, new endpoints in API router, new service for share management
- **Frontend**: New "Share" button component, new public route `/shared/:id`
- **Database**: New migration for `shared_images` table
- **No breaking changes** — new feature only