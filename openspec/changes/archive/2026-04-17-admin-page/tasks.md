## 1. Database migrations

- [x] 1.1 Create Alembic migration `007_add_user_role` — add `role` column (enum: user/admin, default 'user')
- [x] 1.2 Create Alembic migration `008_add_user_blocked` — add `is_blocked` boolean column (default false)
- [ ] 1.3 Run migrations and verify schema changes (run manually with DATABASE_URL set)

## 2. Backend auth updates

- [x] 2.1 Update `User` model — add `role` and `is_blocked` columns
- [x] 2.2 Update `create_access_token()` — include `role` in JWT payload
- [x] 2.3 Update `get_current_user()` — check `is_blocked`, raise 403 if blocked
- [x] 2.4 Create `require_admin()` dependency in `backend/dependencies.py`
- [x] 2.5 Update `TokenResponse` and `UserInfo` schemas — include `role` field
- [x] 2.6 Add tests for blocked user authentication
- [x] 2.7 Add tests for `require_admin()` dependency

## 3. Backend admin API — Templates

- [x] 3.1 Create `backend/routers/admin/templates.py` with router prefix `/api/admin/templates`
- [x] 3.2 Implement `GET /api/admin/templates` — list templates with pagination, search, status filter
- [x] 3.3 Implement `POST /api/admin/templates` — create template
- [x] 3.4 Implement `PUT /api/admin/templates/{id}` — update template
- [x] 3.5 Implement `DELETE /api/admin/templates/{id}` — soft delete (set is_active=false)
- [x] 3.6 Implement `PATCH /api/admin/templates/{id}/activate` — activate template
- [x] 3.7 Add admin router protection with `require_admin` dependency
- [x] 3.8 Add tests for template admin endpoints

## 4. Backend admin API — Users

- [x] 4.1 Create `backend/routers/admin/users.py` with router prefix `/api/admin/users`
- [x] 4.2 Implement `GET /api/admin/users` — list users with pagination, email search
- [x] 4.3 Implement `GET /api/admin/users/{id}` — get user details with render count
- [x] 4.4 Implement `POST /api/admin/users/{id}/block` — block user (set is_blocked, revoke tokens)
- [x] 4.5 Implement `POST /api/admin/users/{id}/unblock` — unblock user
- [x] 4.6 Add tests for user admin endpoints

## 5. Backend admin API — Stats & Dashboard

- [x] 5.1 Create `backend/routers/admin/stats.py` with router prefix `/api/admin/stats`
- [x] 5.2 Implement `GET /api/admin/dashboard` — overview stats (renders 7d, users count, templates count)
- [x] 5.3 Implement `GET /api/admin/stats/renders` — daily render counts with date range
- [x] 5.4 Implement `GET /api/admin/stats/popular-templates` — top templates by render count
- [x] 5.5 Implement `GET /api/admin/stats/user-activity` — new users per day, active users per day
- [x] 5.6 Add Redis caching for stats endpoints (5 min TTL)
- [x] 5.7 Add tests for stats endpoints

## 6. Frontend admin layout and navigation

- [x] 6.1 Create `frontend/src/pages/admin/AdminLayout.tsx` — sidebar + content area layout
- [x] 6.2 Create `frontend/src/components/admin/AdminSidebar.tsx` — navigation links (Dashboard, Templates, Users, Stats)
- [x] 6.3 Create `AdminGuard` component — check JWT role, redirect if not admin
- [x] 6.4 Update `frontend/src/App.tsx` — add `/admin/*` routes with AdminGuard

## 7. Frontend admin pages — Dashboard

- [x] 7.1 Create `frontend/src/pages/admin/AdminDashboard.tsx`
- [x] 7.2 Fetch dashboard data from `/api/admin/dashboard`
- [x] 7.3 Display stat cards (renders 7d, total users, total templates)
- [x] 7.4 Add quick navigation links to other admin sections
- [x] 7.5 Add loading skeletons and error handling

## 8. Frontend admin pages — Templates

- [x] 8.1 Create `frontend/src/pages/admin/AdminTemplates.tsx`
- [x] 8.2 Integrate shadcn/ui DataTable component (simplified table used)
- [x] 8.3 Implement pagination (10/25/50 per page)
- [x] 8.4 Add search by name with debounce
- [x] 8.5 Add status filter (All/Active/Inactive)
- [x] 8.6 Create `TemplateForm` component (create/edit inline card)
- [x] 8.7 Add live preview in template form
- [x] 8.8 Implement delete with confirmation dialog

## 9. Frontend admin pages — Users

- [x] 9.1 Create `frontend/src/pages/admin/AdminUsers.tsx`
- [x] 9.2 Integrate DataTable with user columns (email, role, created, status)
- [x] 9.3 Add email search with debounce
- [x] 9.4 Create `UserDetails` drawer/modal component
- [x] 9.5 Implement block/unblock with confirmation dialogs

## 10. Frontend admin pages — Stats

- [x] 10.1 Create `frontend/src/pages/admin/AdminStats.tsx`
- [x] 10.2 Install chart library (recharts) — using CSS charts instead
- [x] 10.3 Implement date range picker (last 7/14/30 days)
- [x] 10.4 Create renders per day line chart (simplified)
- [x] 10.5 Create popular templates bar chart (simplified)
- [x] 10.6 Create user activity charts (new users, active users)

## 11. Integration and cleanup

- [x] 11.1 Create seed script for first admin user
- [x] 11.2 Run `make lint` — fix ruff and mypy errors
- [x] 11.3 Run `make test` — all tests pass
- [ ] 11.4 Manual E2E test: admin login → dashboard → templates → users → stats
- [ ] 11.5 Test non-admin cannot access admin routes
- [x] 11.6 Update `README.md` — document admin features
