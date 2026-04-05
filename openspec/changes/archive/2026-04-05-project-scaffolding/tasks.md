## 1. Project foundation

- [x] 1.1 Create `backend/` directory structure with `__init__.py`, `routers/`, `services/`, `repositories/`, `schemas/`
- [x] 1.2 Create `pyproject.toml` with FastAPI, SQLAlchemy, uvicorn, alembic, pydantic, asyncpg, redis, pillow dependencies. Also dev deps: ruff, mypy, pytest, pytest-asyncio, httpx, testcontainers. Configure ruff and mypy in pyproject.toml.
- [x] 1.3 Create `frontend/` directory with `package.json` (React 18 + Vite + TypeScript), `vite.config.ts`, `index.html`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`
- [x] 1.4 Create root-level `.gitignore`, `.env.example`, `Makefile`

## 2. Backend scaffolding

- [x] 2.1 Implement `backend/main.py` with FastAPI app registration and root router
- [x] 2.2 Create `backend/app.py` for app factory function
- [x] 2.3 Set up SQLAlchemy async engine with `AsyncSession` dependency injection via `Depends()`. Create `backend/database.py`
- [x] 2.4 Create initial Pydantic schema stubs in `backend/schemas/`
- [x] 2.5 Implement health check endpoint `GET /health` in a dedicated `routers/health.py`. The health check should verify connectivity to PostgreSQL and Redis.

## 3. Database setup

- [x] 3.1 Initialize Alembic with `alembic init` and configure `alembic.ini`
- [x] 3.2 Create initial migration file with placeholder table (e.g., `users`)
- [x] 3.3 Create `backend/repositories/base.py` with generic async repository pattern stub

## 4. Docker configuration

- [x] 4.1 Create `backend/Dockerfile` with multi-stage build (build stage + runtime stage)
- [x] 4.2 Create `frontend/Dockerfile` with multi-stage build (Node build + nginx serve)
- [x] 4.3 Create `docker-compose.yml` with postgres, redis, backend, frontend services
- [x] 4.4 Configure volume mounts for postgres data persistence and backend live-reload
- [x] 4.5 Add health checks and `depends_on` with `condition: service_healthy` for all services
- [x] 4.6 Add Docker `HEALTHCHECK` instruction to both Dockerfiles

## 5. Code quality tooling

- [x] 5.1 Configure ruff in `pyproject.toml` with lint rules and format settings
- [x] 5.2 Configure mypy with `--strict` mode in `pyproject.toml`
- [x] 5.3 Set up `backend/tests/` directory with `conftest.py` and `pytest.ini` integration
- [x] 5.4 Write initial placeholder test `backend/tests/test_health.py` for the health endpoint
- [x] 5.5 Install and configure pre-commit hooks with ruff + mypy

## 6. CI pipeline

- [x] 6.1 Create `.gitlab-ci.yml` (or `.github/workflows/ci.yml`) with lint, mypy, test, frontend-build, and docker-build stages

## 7. Documentation

- [x] 7.1 Write root `README.md` with setup instructions, architecture overview, and development workflow
- [x] 7.2 Update `openspec/config.yaml` with project context referencing the constitution

## 8. Smoke test

- [x] 8.1 Verify `docker compose up` starts all 4 services with green health checks
- [x] 8.2 Verify `curl /api/health` returns 200 OK
- [x] 8.3 Verify `ruff check`, `mypy`, and `pytest` all pass on the backend
- [x] 8.4 Verify frontend `npm run build` produces valid output in `dist/`
