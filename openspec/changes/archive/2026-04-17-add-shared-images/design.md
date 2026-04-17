## Context

The application allows users to create gradient templates and export them as images. Currently, exported images can only be downloaded locally. Users need a way to share their designs via a public URL without requiring authentication. The share ID should be unique, shareable, and persistent.

## Goals / Non-Goals

**Goals:**
- Allow users to create a public shareable link for any rendered image
- Enable viewing shared images by anyone with the link (no auth required)
- Generate human-friendly share IDs that are URL-safe

**Non-Goals:**
- Authentication or user-specific access control for shares
- Expiring or password-protected shares (v1)
- Analytics or view counting for shared images (v1)
- Editing or deleting shared images by viewers (only creator can manage)

## Decisions

### 1. Share ID Generation: Nanoid over UUID

**Decision:** Use `nanoid` library to generate 10-character URL-safe IDs.

**Rationale:** 
- UUIDs are too long (36 chars) for clean URLs
- Nanoid generates ~10 char IDs with configurable alphabet (url-safe by default)
- Better collision resistance than simple random strings
- Faster than UUID generation

**Alternative considered:**
- UUID (rejected: too long for URLs)
- Sequential integer (rejected: exposes usage patterns)

### 2. Database Table: New `shared_images` table

**Decision:** Create a dedicated table instead of extending `render_history`.

**Rationale:**
- Clear separation of concerns between user-owned history and public shares
- Allows future extension (expiration, access control) without polluting render_history
- Simpler permission model - shared_images can be public while render_history remains private

**Schema:**
```
shared_images:
  - id: UUID (PK)
  - render_history_id: UUID (FK to render_history.id)
  - share_id: string (unique index, nanoid)
  - created_at: datetime
```

### 3. Public Access Without Auth

**Decision:** The `GET /api/shared/:shareId` endpoint will be public (no auth required).

**Rationale:**
- Simpler: no session validation needed
- Aligns with the use case: sharing with anyone
- Share IDs are unguessable (nanoid), providing implicit security

### 4. Frontend: Dedicated `/shared/:id` Page

**Decision:** Create a dedicated page rather than embedding in existing routes.

**Rationale:**
- Clean URL structure: `domain.com/shared/abc123def`
- Can be optimized for shared viewing (no editor UI, simpler layout)
- Easier to track analytics separately
- Can add "Create your own" CTA to convert viewers

## Risks / Trade-offs

1. **Share ID collision** → Mitigation: Nanoid's collision resistance is sufficient for this scale. Unlikely in practice.

2. **Content not found (deleted render)** → Return 404 with friendly message. Shared image exists but render may be deleted.

3. **No deletion mechanism** → Users can delete their own shares by deleting the associated render from their history (cascade). No standalone delete for now.

4. **Image not rendering (render failed)** → Return the render as-is. If original render failed, the shared image may show error state.

5. **No rate limiting on public endpoint** → Could be abused. Mitigation: Add rate limiting to the endpoint if abuse detected.

## Migration Plan

1. Create Alembic migration for `shared_images` table
2. Add API endpoints (no breaking changes to existing)
3. Add frontend share button and page
4. Deploy (new feature only, no data migration)