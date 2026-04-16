## 1. Backend dependencies and configuration

- [x] 1.1 Add `passlib[bcrypt]` and `python-jose[cryptography]` to `pyproject.toml` dependencies
- [x] 1.2 Run `uv sync` to install new dependencies
- [x] 1.3 Add `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, and `REFRESH_TOKEN_EXPIRE_DAYS` to `.env.example`
- [x] 1.4 Create `backend/auth_config.py` — load JWT settings from env, generate SECRET_KEY if not set

## 2. Database models and migrations

- [x] 2.1 Create `User` model in `backend/models/__init__.py` (id, email, hashed_password, created_at)
- [x] 2.2 Add `owner_id` (UUID, nullable, FK → users.id) to `RenderHistory` model
- [x] 2.3 Make `RenderHistory.session_id` nullable in the model
- [x] 2.4 Create Alembic migration `005_create_users` — new `users` table with unique email index
- [x] 2.5 Create Alembic migration `006_add_owner_to_history` — add `owner_id` column, make `session_id` nullable, add index on `owner_id`

## 3. Auth utilities and services

- [x] 3.1 Create `backend/services/auth_service.py` — `create_access_token()`, `create_refresh_token()`, `decode_token()`, `get_password_hash()`, `verify_password()`
- [x] 3.2 Create `backend/repositories/user_repository.py` — `create()`, `get_by_email()`, `count_renders_by_user()`
- [x] 3.3 Create Pydantic schemas: `RegisterRequest`, `LoginRequest`, `TokenResponse`, `UserInfo` in `backend/schemas/__init__.py`

## 4. Auth router

- [x] 4.1 Create `backend/routers/auth.py` with `POST /api/auth/register` endpoint
- [x] 4.2 Add `POST /api/auth/login` endpoint (returns access token + sets refresh cookie)
- [x] 4.3 Add `POST /api/auth/refresh` endpoint (validates refresh cookie, issues new tokens)
- [x] 4.4 Add `POST /api/auth/logout` endpoint (clears refresh cookie)
- [x] 4.5 Add `GET /api/auth/me` endpoint (returns user info + render count)
- [x] 4.6 Add `POST /api/auth/migrate-session` endpoint (migrates guest renders to user)
- [x] 4.7 Register auth router in `backend/main.py`

## 5. Auth dependencies (FastAPI)

- [x] 5.1 Create `backend/dependencies.py` — `get_current_user()` dependency (extracts JWT from Authorization header)
- [x] 5.2 Create `get_current_user_optional()` — returns User if JWT present, None otherwise
- [x] 5.3 Add tests for `get_current_user()` with valid token, missing header, expired token

## 6. Update existing routers for dual-mode auth

- [x] 6.1 Update `backend/routers/history.py` — add `GET /api/history/me` endpoint that uses optional auth (user-scoped if JWT, guest-scoped if session_id)
- [x] 6.2 Update `backend/routers/render.py` — set `owner_id` from JWT when authenticated, fall back to `session_id` for guests
- [x] 6.3 Update `RenderRequest` schema — make `session_id` optional (nullable)

## 7. Backend tests

- [x] 7.1 Add `test_auth_service.py` — token creation, decoding, password hashing, verification
- [x] 7.2 Add `test_auth_router.py` — registration, login, refresh, logout, /me, migration
- [x] 7.3 Add `test_user_repository.py` — create, get_by_email, count_renders
- [x] 7.4 Update `test_render.py` — verify owner_id is set for authenticated renders
- [x] 7.5 Update `test_history.py` — verify dual-mode (guest vs auth) history retrieval
- [x] 7.6 Run full test suite, fix any regressions

## 8. Frontend auth context

- [x] 8.1 Replace `useAuth.tsx` SessionProvider with a full `AuthProvider` — manage `accessToken`, `user`, `sessionId`, `isAuthenticated`
- [x] 8.2 Add `login(email, password)`, `register(email, password)`, `logout()` functions to context
- [x] 8.3 Add axios interceptor to attach `Authorization: Bearer <token>` to API requests
- [x] 8.4 Add automatic token refresh on 401 responses (call `/api/auth/refresh`)
- [x] 8.5 Add guest→user migration call after successful login

## 9. Frontend Auth page (login/register)

- [x] 9.1 Replace `Auth.tsx` stub with login form (email + password) using shadcn/ui components
- [x] 9.2 Add registration form (email + password + confirm password) with toggle between login/register views
- [x] 9.3 Add form validation (email format, password ≥8 chars, password match)
- [x] 9.4 Handle auth errors (401, 409, 422) with user-friendly messages
- [x] 9.5 Redirect to `/profile` on successful login, or to `/` if coming from guest

## 10. Frontend Profile page

- [x] 10.1 Replace `Profile.tsx` stub with real profile — email, created_at, render count from `GET /api/auth/me`
- [x] 10.2 Add Logout button that calls `POST /api/auth/logout` and clears local state
- [x] 10.3 Show guest-mode info when not authenticated (session ID, "Log in for persistent history" prompt)
- [x] 10.4 Add loading skeleton while fetching user data

## 11. Frontend routing and guards

- [x] 11.1 Update `Header.tsx` — show "Login" / "Profile" links based on auth state
- [x] 11.2 Update `Editor.tsx` and `History.tsx` to use new auth context instead of old `useSession`
- [x] 11.3 Ensure all API calls use the new auth-enabled API layer (with Bearer tokens when logged in)

## 12. Integration testing and cleanup

- [ ] 12.1 Manual E2E test: register → login → render → check history → logout → guest render → login → migrate → verify guest renders appear
- [x] 12.2 Run `make lint` (ruff + mypy) — fix any errors
- [x] 12.3 Run `make test` — all tests pass
- [x] 12.4 Update `docker-compose.yml` — ensure new env vars are passed to backend container
- [x] 12.5 Update `README.md` — document new auth flow and env vars
