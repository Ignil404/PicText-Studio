## ADDED Requirements

### Requirement: docker compose up runs all services
A `docker-compose.yml` file SHALL exist at the project root. Running `docker compose up` SHALL start all services: PostgreSQL, Redis, backend, and frontend.

#### Scenario: Full stack starts
- **WHEN** `docker compose up` is executed from the project root
- **THEN** all four services (postgres, redis, backend, frontend) start without errors

#### Scenario: Graceful shutdown
- **WHEN** `docker compose down` is run
- **THEN** all containers stop cleanly

### Requirement: Postgres service configuration
The PostgreSQL service SHALL use the official `postgres` Docker image, expose its standard port, and mount a named volume for data persistence.

#### Scenario: Postgres is accessible
- **WHEN** `docker compose up -d postgres` completes
- **THEN** the database accepts connections on the configured port with the configured credentials

#### Scenario: Data persists across restarts
- **WHEN** data is written to the database, the container is stopped and restarted
- **THEN** the previously written data is still present

### Requirement: Redis service configuration
The Redis service SHALL use the official `redis` Docker image and be accessible only within the compose network (not exposed to the host).

#### Scenario: Redis accepts connections
- **WHEN** `docker compose up -d redis` completes
- **THEN** the Redis instance accepts connections from the backend container

#### Scenario: Redis not exposed to host
- **WHEN** the compose file is examined
- **THEN** Redis has no ports mapped to the host machine

### Requirement: Multi-stage backend Dockerfile
The backend SHALL have a multi-stage Dockerfile that produces a production-ready image containing only runtime dependencies and compiled Python code.

#### Scenario: Backend image builds
- **WHEN** `docker build -f backend/Dockerfile backend/` is run
- **THEN** it completes with no dev dependencies in the final layer

### Requirement: Frontend Dockerfile
The frontend SHALL have its own Dockerfile that builds the static assets and serves them with a lightweight HTTP server (e.g., nginx).

#### Scenario: Frontend image builds
- **WHEN** `docker build -f frontend/Dockerfile frontend/` is run
- **THEN** it produces an image that serves the built frontend assets

### Requirement: Environment variable configuration
Sensitive configuration (database credentials, secrets) SHALL be passed via environment variables in a `.env` file. The `.env` file SHALL NOT be committed to the repository. A `.env.example` SHALL be provided with placeholder values.

#### Scenario: Environment loads from .env
- **WHEN** `docker compose up` is run with a `.env` file present
- **THEN** services use the values from that file

#### Scenario: Example env is available
- **WHEN** `.env` is missing
- **THEN** `.env.example` provides all required variable keys with placeholder values