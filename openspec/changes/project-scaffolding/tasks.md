## 1. Project foundation

- [ ] 1.1 Create `backend/` directory structure with `__init__.py`, `main.py`, `routers/`, `services/`, `repositories/`
- [ ] 1.2 Create `pyproject.toml` with FastAPI, SQLAlchemy, uvicorn, alembic, pydantic dependencies
- [ ] 1.3 Create `frontend/` directory with `package.json`, `vite.config.ts`, `index.html`, `src/main.ts`
- [ ] 1.4 Create root-level `.gitignore`, `.env.example`, `Makefile`

## 2. Backend scaffolding

- [ ] 2.1 Implement `backend/main.py` with FastAPI app registration and root router
- [ ] 2.2 Create `backend/app.py` for app factory function
- [ ] 2.3 Set up SQLAlchemy async engine with `AsyncSession` dependency injection via `Depends()`
- [ ] 2.4 Create initial Pydantic schema stubs in `backend/schemas/`
- [ ] 2.5 Implement health check endpoint `GET /health` in a dedicated `routers/health.py`

## 3. Database setup

- [ ] 3.1 Initialize Alembic with `alembic init` and configure `alembic.ini`
- [ ] 3.2 Create initial migration file with placeholder table (e.g., `users`)
- [ ] 3.3 Create `backend/repositories/base.py` with generic async repository pattern stub

## 4. Docker configuration

- [ ] 4.1 Create `backend/Dockerfile` with multi-stage build (build stage + runtime stage)
- [ ] 4.2 Create `frontend/Dockerfile` with multi-stage build (Node build + nginx serve)
- [ ] 4.3 Create `docker-compose.yml` with postgres, redis, backend, frontend services
- [ ] 4.4 Configure volume mounts for postgres data persistence and backend live-reload
- [ ] 4.5 Add health checks and `depends_on` with `condition: service_healthy` for all services
- [ ] 4.6 Add Docker `HEALTHCHECK` instruction to both Dockerfiles

## 5. Code quality tooling

- [ ] 5.1 Configure ruff in `pyproject.toml` with lint rules and format settings
- [ ] 5.2 Configure mypy with `--strict` mode in `pyproject.toml`
- [ ] 5.3 Set up `backend/tests/` directory with `conftest.py` and `pytest.ini` integration
- [ ] 5.4 Write initial placeholder test `backend/tests/test_health.py` for the health endpoint
- [ ] 5.5 Install and configure pre-commit hooks with ruff + mypy

## 6. CI pipeline

- [ ] 6.1 Create `.gitlab-ci.yml` (or `.github/workflows/ci.yml`) with lint, mypy, test, frontend-build, and docker-build stages

## 7. Documentation

- [ ] 7.1 Write root `README.md` with setup instructions, architecture overview, and development workflow
- [ ] 7.2 Update `openspec/config.yaml` with project context referencing the constitution

## 8. Smoke test

- [ ] 8.1 Verify `docker compose up` starts all 4 services with green health checks
- [ ] 8.2 Verify `curl /health` returns 200 OK
- [ ] 8.3 Verify `ruff check`, `mypy`, and `pytest` all pass on the backend
- [ ] 8.4 Verify frontend `npm run build` produces valid output in `dist/`