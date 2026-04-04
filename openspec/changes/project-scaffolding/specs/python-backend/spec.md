## ADDED Requirements

### Requirement: FastAPI application structure
The backend SHALL be structured as a Python FastAPI application with clear SRP separation: routers handle HTTP, services contain business logic, and repositories handle data access. The application SHALL use Python 3.12+ and follow the Router → Service → Repository layering pattern.

#### Scenario: Application starts correctly
- **WHEN** the FastAPI application is initialized
- **THEN** all routers are registered with the app instance and the app is importable without errors

#### Scenario: Layer separation is enforced
- **WHEN** a router is examined
- **THEN** it SHALL contain only HTTP handling (parsing requests, calling services, returning responses) with no business logic or SQL

### Requirement: Pydantic request/response schemas
The application SHALL use Pydantic models to define all request and response schemas. Validation SHALL occur at the API boundary.

#### Scenario: Invalid request is rejected
- **WHEN** a request is sent with missing or malformed required fields
- **THEN** the API returns a 422 response with validation error details

#### Scenario: Valid request returns typed response
- **WHEN** a valid request matching the schema is sent
- **THEN** the API returns a response that conforms to the defined response schema

### Requirement: Dependency injection via FastAPI Depends
External dependencies (database sessions, services) SHALL be injected using FastAPI's `Depends()` mechanism. No global singletons or manual DI containers.

#### Scenario: Database session is injected
- **WHEN** an endpoint requires a database session
- **THEN** the session is provided via a `Depends()` call and is scoped to the request lifetime

### Requirement: SQLAlchemy async ORM
The backend SHALL use SQLAlchemy with async engine (`AsyncSession`) for all database operations. No raw SQL for data access in business logic.

#### Scenario: Repository uses async session
- **WHEN** a repository queries the database
- **THEN** it uses an `AsyncSession` obtained through dependency injection

### Requirement: Package management with uv
The project SHALL use `uv` for dependency management with a `pyproject.toml` file. Production and development dependencies SHALL be separated.

#### Scenario: Dependencies install successfully
- **WHEN** `uv sync` is run in the backend directory
- **THEN** all production dependencies install without errors