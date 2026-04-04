# Project Constitution

## Code Quality

- Write clean, intentional, and readable code. If it takes explanation to understand, it's probably trying too hard.
- Eliminate duplication aggressively. DRY is the default.
- No dead code, no commented-out code, no "we might need this later" abstractions.
- Keep dependencies minimal. Every package added carries maintenance and security burden.
- All public APIs and non-trivial functions must have automated tests.
- Code reviews are mandatory — no merges without at least one review.

## Architecture: Single Responsibility Principle

- Every module, class, and function must have exactly one reason to change.
- If a component does more than one thing, split it. No exceptions.
- Layer boundaries are strict: UI never talks directly to the database, services never render HTML, handlers never contain business logic.
- Dependency direction is always inward: frameworks depend on business logic, not the other way around.
- Prefer composition over inheritance. Prefer passing data over shared state.

## Stack: Frontend / Backend Separation

- Frontend and backend are separate services with no shared code or build process.
- Backend exposes a well-defined API (REST or GraphQL). Frontend is a client of that API, nothing else.
- No server-side rendering that mixes frontend templates with backend logic.
- API contracts are versioned and documented. Breaking changes require version bumps.
- Each service has its own repository or at least its own directory with independent Dockerfile.

## Deployment: Docker-First

- Every service runs in a container. If it doesn't run in Docker, it doesn't run.
- `docker compose` is the development environment. No manual installs of databases, caches, or services.
- Production deployment targets containers. Environment configuration goes via environment variables, not config files checked into the repo.
- Multi-stage builds keep images small and production-ready. No dev dependencies in final images.
- Health checks, restart policies, and proper port exposure are mandatory in compose configuration.

## Database: PostgreSQL

- PostgreSQL is the primary database for all persistent data.
- No raw SQL ad-hoc in business logic. Use an ORM or query builder with typed migrations.
- All schema changes go through migration files, never manual ALTER TABLE against production.
- Indexes are designed, not accidental. Foreign keys are always enforced.
- Database connection pooling is mandatory. Never open unbounded connections.

## Caching: Redis

- Redis is used only for cache and ephemeral state (sessions, rate limits, job queues).
- Never use Redis as a primary data store. If data must survive cache eviction, it belongs in PostgreSQL.
- Cache keys are namespaced and documented. TTLs are set explicitly, never open-ended.
- Cache invalidation strategy is designed before cache reads are added.