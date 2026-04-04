# Implement Project Scaffolding

## Context

Greenfield internship project (FSD2 Spring 2026). No code exists. The OpenSpec change `project-scaffolding` defines 30 tasks across 8 groups to build the full project skeleton: FastAPI backend, Vite frontend, Docker Compose with Postgres + Redis, CI/CD, code quality tooling, and health monitoring.

The specification is at `openspec/changes/project-scaffolding/tasks.md`.

## Implementation Order

All 30 tasks executed sequentially, grouped by dependency:

### Phase 1: Backend directory + pyproject.toml (tasks 1.1, 1.2, 5.1, 5.2)
Create `backend/` structure with all subdirectories. Write `pyproject.toml` with all dependencies (FastAPI, SQLAlchemy async, uvicorn, alembic, pydantic, psycopg2-binary) and dev tools (ruff, mypy, pytest, httpx, testcontainers). Configure ruff and mypy in the same file.

### Phase 2: Frontend scaffold (task 1.3)
Create `frontend/` with `package.json` (Vite + TypeScript), `vite.config.ts`, `index.html`, `src/main.ts`.

### Phase 3: Root files (task 1.4)
Create `.gitignore`, `.env.example`, `Makefile` (with `dev`, `lint`, `test`, `build` targets).

### Phase 4: Backend app + health endpoint (tasks 2.1, 2.2, 2.3, 2.4, 2.5)
- `backend/app.py` — app factory with CORS middleware
- `backend/database.py` — async engine, session factory, `get_session` DI
- `backend/main.py` — imports app, includes routers
- `backend/routers/health.py` — `GET /health` checking DB + Redis connectivity
- `backend/schemas/__init__.py` — stub
- `backend/services/__init__.py` — stub
- `backend/repositories/__init__.py` — stub

### Phase 5: Database setup (tasks 3.1, 3.2, 3.3)
- `alembic.ini` + `backend/alembic/` with env.py configured for async SQLAlchemy
- Initial migration with placeholder `users` table
- `backend/repositories/base.py` — generic async repository stub

### Phase 6: Docker (tasks 4.1-4.6)
- `backend/Dockerfile` — multi-stage (uv install → runtime)
- `frontend/Dockerfile` — multi-stage (node build → nginx)
- `docker-compose.yml` — 4 services with health checks, depends_on, volumes, env
- `nginx.conf` for frontend serving

### Phase 7: Tests (tasks 5.3, 5.4)
- `backend/tests/conftest.py` — pytest fixtures
- `backend/tests/test_health.py` — test health endpoint

### Phase 8: Pre-commit + CI (tasks 5.5, 6.1)
- `.pre-commit-config.yaml` — ruff + mypy hooks
- `.gitlab-ci.yml` — lint, mypy, test, frontend-build, docker-build stages

### Phase 9: Docs (tasks 7.1, 7.2)
- `README.md` — setup instructions, architecture diagram, dev workflow
- Update `openspec/config.yaml` with project context

### Phase 10: Smoke test (tasks 8.1-8.4)
Run `docker compose up`, verify health check, run linters/tests, verify frontend build.

## Verification

```bash
# All services start healthy
docker compose up -d && docker compose ps

# Health check
curl http://localhost:8000/health

# Backend quality gates
cd backend && ruff check && ruff format --check && mypy . && pytest

# Frontend build
cd frontend && npm run build
```

## Commit Strategy

Commit at logical milestones (ask user before each):
1. Phase 1-3: Project foundation
2. Phase 4-5: Backend + DB
3. Phase 6: Docker
4. Phase 7-8: Tests + CI
5. Phase 9-10: Docs + smoke test