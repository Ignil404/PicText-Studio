## 1. Database Setup

- [x] 1.1 Create Alembic migration for `shared_images` table with columns: id (UUID PK), render_history_id (UUID FK), share_id (string unique indexed, 10 chars), created_at (datetime)
- [x] 1.2 Run migration to create table in database

## 2. Backend - Shared Images API

- [x] 2.1 Create SQLAlchemy model `SharedImage` in `app/models/shared_image.py` with fields: id, render_history_id, share_id, created_at
- [x] 2.2 Add `SharedImage` to database session and model exports
- [x] 2.3 Create shared image service `app/services/shared_image_service.py` with methods: create_share(render_history_id, owner), get_by_share_id(share_id)
- [x] 2.4 Generate share_id using nanoid (10 chars, URL-safe)
- [x] 2.5 Add `POST /api/shared` endpoint in `app/api/v1/shares.py`:
  - Accept `render_history_id` in body
  - Validate render exists and user owns it (or guest session owns it)
  - Create shared record and return `{share_id, url}`
  - Return 404 if render not found, 403 if not authorized
- [x] 2.6 Add `GET /api/shared/:shareId` endpoint:
  - Return render data (template_id, text_blocks, image_url, created_at)
  - Return 404 if share_id not found or render deleted

## 3. Frontend - Share Button

- [x] 3.1 Create `ShareButton` component in `frontend/src/components/ShareButton.tsx`
- [x] 3.2 Add share button to editor page after export is complete
- [x] 3.3 On click, call `POST /api/shared` with render_history_id
- [x] 3.4 Show share URL in a copyable input field or copy-to-clipboard toast
- [x] 3.5 Use existing API client pattern from the project

## 4. Frontend - Shared Image Page

- [x] 4.1 Add route `/shared/:shareId` in `frontend/src/App.tsx`
- [x] 4.2 Create `SharedImagePage` component in `frontend/src/pages/SharedImagePage.tsx`
- [x] 4.3 On mount, fetch `GET /api/shared/:shareId`
- [x] 4.4 Display the rendered image with template and text blocks
- [x] 4.5 Handle loading and error states (404, etc.)
- [x] 4.6 Add "Create your own" CTA button linking to editor

## 5. Verification

- [x] 5.1 Run ruff and mypy on backend code
- [x] 5.2 Run TypeScript check on frontend code
- [x] 5.3 Verify all endpoints work via curl/Postman or browser
- [x] 5.4 Test share creation from editor
- [x] 5.5 Test viewing shared image in incognito mode (no auth)