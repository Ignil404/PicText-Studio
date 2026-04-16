## Context

PicText Studio currently operates in guest-only mode. Users get a localStorage UUID session, render images, and view history — all anonymous. Auth.tsx and Profile.tsx are placeholder pages with emoji + "coming soon" text. The backend has no user concept: `render_history` is keyed on `session_id` (a plain string). The project uses FastAPI + SQLAlchemy async + PostgreSQL, React + Vite + TypeScript, and Docker Compose for local dev.

## Goals / Non-Goals

**Goals:**
- Real user registration (email + password) and login/logout
- JWT-based auth: access token (short-lived) + refresh token (httpOnly cookie)
- Guest → user migration: when a guest logs in, their session renders are migrated to their account
- Dual-mode access: guests continue to work without auth, logged-in users get scoped history
- Profile page with user info and render stats
- Protected API endpoints (history, render) that accept either guest session_id or user JWT

**Non-Goals:**
- OAuth/social login (GitHub, Google) — deferred to future
- Email verification flow — no verification emails for now
- Password reset / forgot password — deferred
- Role-based access control (admin vs user) — single role for now
- Multi-device session management — no "active sessions" dashboard

## Decisions

### 1. JWT with access + refresh token pattern

**Decision:** Short-lived JWT access tokens (15 min) in `localStorage` + httpOnly refresh token cookie (7 days).

**Why:** Access tokens in localStorage are simple for the SPA to include in `Authorization: Bearer` headers. Refresh tokens in httpOnly cookies are not accessible to XSS — they're only sent to `/api/auth/refresh` by the browser. This balances convenience and security for a student project.

**Alternatives considered:**
- Both tokens in localStorage → simpler but vulnerable to XSS
- Both tokens in httpOnly cookies → CSRF protection complexity, harder with CORS
- Session-based (server-side sessions) → adds Redis session store complexity; JWT is stateless

### 2. Password hashing: bcrypt via `passlib[bcrypt]`

**Decision:** Use `passlib[bcrypt]` with `BcryptContext` (12 rounds) for password hashing.

**Why:** `passlib` is the standard Python library for password hashing, well-tested, supports bcrypt which is industry-standard. It integrates cleanly with FastAPI dependencies.

**Alternatives considered:**
- `argon2-cffi` → Argon2 is newer but bcrypt is simpler and sufficient
- `bcrypt` directly → passlib provides a cleaner context API and algorithm swapping

### 3. User model: email as unique identifier

**Decision:** `User` table with `email` (unique, indexed), `hashed_password`, `created_at`. No username field.

```
┌─────────────────────────────────┐
│             users               │
├────────────────┬────────────────┤
│ id             │ UUID (PK)      │
│ email          │ VARCHAR(255)   │ ← unique, indexed
│ hashed_password│ VARCHAR(255)   │
│ created_at     │ TIMESTAMP TZ   │
└────────────────┴────────────────┘
```

**Why:** Email is the simplest unique identifier. No username avoids collision issues and simplifies UX.

### 4. Dual-mode history: guest + authenticated

**Decision:** `render_history` gets a nullable `owner_id` FK to `users.id`. Guest renders have `owner_id = NULL` with a `session_id`. Authenticated renders have `owner_id` set (and `session_id` still recorded for audit).

```
┌──────────────────────────────────────────┐
│          render_history                  │
├───────────────┬──────────────────────────┤
│ id            │ UUID (PK)                │
│ session_id    │ VARCHAR(255) (nullable)  │ ← guest: always set
│ owner_id      │ UUID (FK→users, nullable)│ ← auth: set
│ template_id   │ UUID (FK→templates)      │
│ text_blocks   │ JSONB                    │
│ image_path    │ VARCHAR(500) → TEXT      │
│ created_at    │ TIMESTAMP TZ             │
└───────────────┴──────────────────────────┘
       │                          │
       │ owner_id IS NOT NULL     │ owner_id IS NULL
       │ → user-scoped history    │ → guest-scoped history
       └──────────────────────────┘
```

**API behavior:**
- `GET /api/history/me` — if authenticated (JWT present): returns user's history. If guest: falls back to `session_id` lookup.
- `POST /api/render` — if authenticated: sets `owner_id` from JWT `sub`. If guest: uses `session_id` from body.

**Why:** This lets guests continue to work without logging in, while giving logged-in users persistent history. No breaking change for existing clients.

### 5. Guest → user migration on first login

**Decision:** When a user logs in for the first time, and a `session_id` is present in the client, the frontend calls `POST /api/auth/migrate-session` with the `session_id`. The backend updates all `render_history` rows matching that `session_id` with `owner_id = user.id`.

```
POST /api/auth/migrate-session
Body: { "session_id": "abc-123" }
→ UPDATE render_history SET owner_id = :user_id WHERE session_id = :session_id AND owner_id IS NULL
```

**Why:** Simple, single-shot migration. User gets their guest renders back. No data loss.

### 6. Auth as FastAPI dependency, not middleware

**Decision:** Use a FastAPI `Depends()` function `get_current_user()` that extracts and validates the JWT from the `Authorization` header. Endpoints that need auth use `user: User = Depends(get_current_user)`. Endpoints that support both guest+auth use `Optional[User] = Depends(get_current_user_optional)`.

**Why:** FastAPI's dependency injection is cleaner than starlette middleware for this use case — it's testable, composable, and per-endpoint.

### 7. CORS: credentials allowed for cookies

**Decision:** Add `allow_credentials=True` to CORS middleware so refresh token cookies work. Set `Access-Control-Allow-Origin` to the frontend URL explicitly (not `*`).

**Why:** Required for httpOnly cookies to be sent cross-origin (backend :8000 → frontend :5173).

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| JWT in localStorage is vulnerable to XSS | Keep access token short-lived (15 min); refresh token in httpOnly cookie |
| Guest migration might miss renders if session_id cleared before login | Migration happens immediately after successful login, before any session cleanup |
| Adding auth increases complexity of existing endpoints | Use optional auth dependency — existing guest flow unchanged |
| Email collision on registration | Return 409 Conflict with clear error message |
| Passwords are sensitive data | Never log hashed passwords; use parameterized queries; bcrypt is one-way |
| `owner_id` nullable means two lookup paths for history | Clear convention: auth → `owner_id`, guest → `session_id`; never both for same query |

## Migration Plan

1. **Deploy new dependencies**: `passlib[bcrypt]`, `python-jose[cryptography]` in `pyproject.toml`
2. **Run Alembic migrations**: 
   - `005_create_users` — new `users` table
   - `006_add_owner_to_history` — add nullable `owner_id` FK to `render_history`, make `session_id` nullable
3. **Deploy backend** — new auth endpoints, updated history/render logic
4. **Deploy frontend** — new Auth/Profile pages, auth context, token interceptor
5. **Rollback strategy**: Each Alembic migration has a `downgrade()`; revert code deploy, run downgrade

## Open Questions

- Should we enforce a minimum password length? (Proposed: 8 chars)
- Should guest access to `/api/history/me` return 401 or fall back to session_id? (Proposed: fallback — keeps guest UX working)
- Do we want to add rate limiting on login/register to prevent brute force? (Proposed: deferred, but should be on the roadmap)
