## ADDED Requirements

### Requirement: Backend health check endpoint
The backend SHALL expose a `/health` endpoint that returns HTTP 200 with a JSON body when the service is running and able to connect to its dependencies (PostgreSQL, Redis).

#### Scenario: Healthy response
- **WHEN** a GET request is sent to `/health`
- **THEN** the endpoint returns 200 with `{"status": "ok"}`

#### Scenario: Dependency failure
- **WHEN** PostgreSQL is unavailable and a GET request is sent to `/health`
- **THEN** the endpoint returns 503 with a status indicating which dependency is failing

### Requirement: Docker health checks
The backend and frontend Dockerfiles SHALL include Docker `HEALTHCHECK` instructions. The compose file SHALL define health checks for all services.

#### Scenario: Docker reports healthy
- **WHEN** `docker compose ps` is viewed after services start
- **THEN** each service shows a `healthy` status

#### Scenario: Unhealthy service is detected
- **WHEN** a service dependency is killed
- **THEN** Docker marks the service as `unhealthy`

### Requirement: Postgres and Redis readiness
The compose file SHALL use `depends_on` with `condition: service_healthy` so that backend and frontend only start after their dependencies are ready.

#### Scenario: Backend waits for postgres
- **WHEN** `docker compose up` starts all services
- **THEN** the backend container does not start until postgres reports healthy

#### Scenario: Frontend waits for backend
- **WHEN** `docker compose up` starts all services
- **THEN** the frontend container starts only after the backend is healthy
