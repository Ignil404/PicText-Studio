## Why

Auth and Profile pages are currently stubs. Users work purely in guest mode with a localStorage session UUID — no registration, no login, no user identity. This means renders are tied to an anonymous session that can't be recovered across devices or browsers. Adding real user accounts enables persistent render history, cross-device access, and future features like saved templates and sharing.

## What Changes

- Add user registration (email + password) and login/logout via JWT access tokens
- Replace guest session UUID with user-scoped render history (while keeping guest → merge on first login)
- Replace Auth.tsx stub with real login/register forms
- Replace Profile.tsx stub with user profile page (email, render count, settings)
- Add JWT-based auth middleware to protect render/history endpoints (optional — guest access still works)
- Add `users` table + `owner_id` FK on `render_history`
- Migrate existing anonymous renders to user accounts when a guest logs in for the first time

## Capabilities

### New Capabilities
- `user-auth`: Registration, login, logout, JWT token issuance/refresh, password hashing, auth middleware
- `user-profile`: User profile page, account settings, render statistics

### Modified Capabilities
- `session-management`: Session model changes from localStorage-only UUID to a dual model — guest sessions continue to work, but logged-in users have server-side session tokens. Render requests include either `session_id` (guest) or JWT `sub` (authenticated).
- `render-history`: History becomes user-scoped when authenticated. Guest renders migrate to user account on first login. `GET /api/history/{session_id}` becomes `GET /api/history/me` for authed users, with optional guest fallback.

## Impact

- **Backend**: New `User` model, `users` table (Alembic migration), JWT auth dependency (`python-jose` or `PyJWT` + `bcrypt`), new auth router (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`), auth middleware (dependency), `RenderHistory.owner_id` FK, updated history/render routers
- **Frontend**: Auth.tsx → login/register forms, Profile.tsx → real profile, auth context (JWT storage, refresh interceptor), route guards, guest→user history migration flow
- **Database**: New `users` table, `render_history.owner_id` column (nullable, FK to users)
- **Specs**: 2 new specs (`user-auth`, `user-profile`), 2 modified specs (`session-management`, `render-history`)
