## 1. Backend dependencies and configuration

- [ ] 1.1 Add `passlib[bcrypt]` and `python-jose[cryptography]` to `pyproject.toml` dependencies
- [ ] 1.2 Run `uv sync` to install new dependencies
- [ ] 1.3 Add `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, and `REFRESH_TOKEN_EXPIRE_DAYS` to `.env.example`
- [ ] 1.4 Create `backend/auth_config.py` — load JWT settings from env, generate SECRET_KEY if not set

## 2. Database models and migrations

- [ ] 2.1 Create `User` model in `backend/models/__init__.py` (id, email, hashed_password, created_at)
- [ ] 2.2 Add `owner_id` (UUID, nullable, FK → users.id) to `RenderHistory` model
- [ ] 2.3 Make `RenderHistory.session_id` nullable in the model
- [ ] 2.4 Create Alembic migration `005_create_users` — new `users` table with unique email index
- [ ] 2.5 Create Alembic migration `006_add_owner_to_history` — add `owner_id` column, make `session_id` nullable, add index on `owner_id`

## 3. Auth utilities and services

- [ ] 3.1 Create `backend/services/auth_service.py` — `create_access_token()`, `create_refresh_token()`, `decode_token()`, `get_password_hash()`, `verify_password()`
- [ ] 3.2 Create `backend/repositories/user_repository.py` — `create()`, `get_by_email()`, `count_renders_by_user()`
- [ ] 3.3 Create Pydantic schemas: `RegisterRequest`, `LoginRequest`, `TokenResponse`, `UserInfo` in `backend/schemas/__init__.py`

## 4. Auth router

- [ ] 4.1 Create `backend/routers/auth.py` with `POST /api/auth/register` endpoint
- [ ] 4.2 Add `POST /api/auth/login` endpoint (returns access token + sets refresh cookie)
- [ ] 4.3 Add `POST /api/auth/refresh` endpoint (validates refresh cookie, issues new tokens)
- [ ] 4.4 Add `POST /api/auth/logout` endpoint (clears refresh cookie)
- [ ] 4.5 Add `GET /api/auth/me` endpoint (returns user info + render count)
- [ ] 4.6 Add `POST /api/auth/migrate-session` endpoint (migrates guest renders to user)
- [ ] 4.7 Register auth router in `backend/main.py`

## 5. Auth dependencies (FastAPI)

- [ ] 5.1 Create `backend/dependencies.py` — `get_current_user()` dependency (extracts JWT from Authorization header)
- [ ] 5.2 Create `get_current_user_optional()` — returns User if JWT present, None otherwise
- [ ] 5.3 Add tests for `get_current_user()` with valid token, missing header, expired token

## 6. Update existing routers for dual-mode auth

- [ ] 6.1 Update `backend/routers/history.py` — add `GET /api/history/me` endpoint that uses optional auth (user-scoped if JWT, guest-scoped if session_id)
- [ ] 6.2 Update `backend/routers/render.py` — set `owner_id` from JWT when authenticated, fall back to `session_id` for guests
- [ ] 6.3 Update `RenderRequest` schema — make `session_id` optional (nullable)

## 7. Backend tests

- [ ] 7.1 Add `test_auth_service.py` — token creation, decoding, password hashing, verification
- [ ] 7.2 Add `test_auth_router.py` — registration, login, refresh, logout, /me, migration
- [ ] 7.3 Add `test_user_repository.py` — create, get_by_email, count_renders
- [ ] 7.4 Update `test_render.py` — verify owner_id is set for authenticated renders
- [ ] 7.5 Update `test_history.py` — verify dual-mode (guest vs auth) history retrieval
- [ ] 7.6 Run full test suite, fix any regressions

## 8. Frontend auth context

- [ ] 8.1 Replace `useAuth.tsx` SessionProvider with a full `AuthProvider` — manage `accessToken`, `user`, `sessionId`, `isAuthenticated`
- [ ] 8.2 Add `login(email, password)`, `register(email, password)`, `logout()` functions to context
- [ ] 8.3 Add axios interceptor to attach `Authorization: Bearer <token>` to API requests
- [ ] 8.4 Add automatic token refresh on 401 responses (call `/api/auth/refresh`)
- [ ] 8.5 Add guest→user migration call after successful login

## 9. Frontend Auth page (login/register)

- [ ] 9.1 Replace `Auth.tsx` stub with login form (email + password) using shadcn/ui components
- [ ] 9.2 Add registration form (email + password + confirm password) with toggle between login/register views
- [ ] 9.3 Add form validation (email format, password ≥8 chars, password match)
- [ ] 9.4 Handle auth errors (401, 409, 422) with user-friendly messages
- [ ] 9.5 Redirect to `/profile` on successful login, or to `/` if coming from guest

## 10. Frontend Profile page

- [ ] 10.1 Replace `Profile.tsx` stub with real profile — email, created_at, render count from `GET /api/auth/me`
- [ ] 10.2 Add Logout button that calls `POST /api/auth/logout` and clears local state
- [ ] 10.3 Show guest-mode info when not authenticated (session ID, "Log in for persistent history" prompt)
- [ ] 10.4 Add loading skeleton while fetching user data

## 11. Frontend routing and guards

- [ ] 11.1 Update `Header.tsx` — show "Login" / "Profile" links based on auth state
- [ ] 11.2 Update `Editor.tsx` and `History.tsx` to use new auth context instead of old `useSession`
- [ ] 11.3 Ensure all API calls use the new auth-enabled API layer (with Bearer tokens when logged in)

## 12. Integration testing and cleanup

- [ ] 12.1 Manual E2E test: register → login → render → check history → logout → guest render → login → migrate → verify guest renders appear
- [ ] 12.2 Run `make lint` (ruff + mypy) — fix any errors
- [ ] 12.3 Run `make test` — all tests pass
- [ ] 12.4 Update `docker-compose.yml` — ensure new env vars are passed to backend container
- [ ] 12.5 Update `README.md` — document new auth flow and env vars
