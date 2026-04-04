## Context

Greenfield internship project (Spring 2026, FSD2). No code exists yet. The constitution defines non-negotiables: Docker-first, PostgreSQL, Redis, SRP architecture, clean frontend/backend separation.

## Goals / Non-Goals

**Goals:**

- Fully runnable development environment via `docker compose up`
- Separated backend (Python/FastAPI) and frontend (SPA) as independent services
- PostgreSQL as the sole persistent database with Alembic migrations
- Redis for caching/sessions only, with explicit TTLs
- Code quality gate: ruff + mypy + pytest — green CI required
- Health check endpoints on all services

**Non-Goals:**

- CI/CD is limited to lint+test+build verification (no complex pipelines)
- Production deployment configuration — dev-only for now
- Authentication, multi-tenancy, or business domain logic — scaffolding only

## Decisions

**Backend: Python + FastAPI**
FastAPI offers typed request/response models, built-in validation via Pydantic, async support, and auto-generated OpenAPI docs. It's lightweight enough for an internship project while being production-grade.
*Alternatives:* Django (too heavy, mixes concerns), Flask (no async, more boilerplate). FastAPI is the modern default for Python APIs.

**Frontend: Vite + vanilla framework (placeholder)**
Scaffolded as a Vite project. Specific framework (React/Vue/etc.) is TBD — Vite works for any.
*Alternatives:* Create React App (deprecated), Next.js (implies React). Vite is framework-agnostic and fast.

**Database: PostgreSQL + Alembic**
Alembic is the standard migration tool for Python/SQLAlchemy projects. It integrates cleanly with the FastAPI service layer.

**Service layer pattern: Router → Service → Repository**
Strict SRP: routers handle HTTP, services contain business logic, repositories handle data access. Each layer depends only on the one below it.

**Dependency injection: FastAPI's built-in DI**
No separate DI container. FastAPI's `Depends()` handles wire-up cleanly for this scale. SQLAlchemy `AsyncSession` is injected per-request.

**Testing: pytest + httpx (async client) + TestContainers**
TestContainers spins up real PostgreSQL and Redis for integration tests. No mocking of databases — constitution requires real DB integration.

## Risks / Trade-offs

**[Vite without chosen framework]** → Risk: scaffolding might need adjustment when framework is selected later. Mitigation: keep frontend minimal — just Vite config, an `index.html`, and a basic entry point.

**[TestContainers CI overhead]** → Risk: spinning up real containers in CI may be slow. Mitigation: acceptable for internship project; can optimize later.

**[No auth yet]** → Risk: API is wide open. Mitigation: intentional for scaffolding — auth spec can follow.

## Open Questions

- Which frontend framework to use? Deferred to separate decision.
- Monorepo vs separate repos? Starting monorepo-style with `backend/` and `frontend/` directories — can split later.
- Python version? 3.12+.