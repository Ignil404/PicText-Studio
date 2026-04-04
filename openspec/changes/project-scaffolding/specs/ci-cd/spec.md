## ADDED Requirements

### Requirement: CI pipeline on push
A CI pipeline SHALL run on every push to the `master` branch and on every merge request. It SHALL execute linting, type checking, and tests.

#### Scenario: CI runs on push
- **WHEN** code is pushed to `master` or a merge request is created
- **THEN** the CI pipeline is triggered

#### Scenario: Linting passes
- **WHEN** the CI pipeline reaches the lint step
- **THEN** ruff (linter) runs on the backend codebase and exits with code 0

#### Scenario: Type checking passes
- **WHEN** the CI pipeline reaches the type check step
- **THEN** mypy runs on the backend codebase and exits with code 0

#### Scenario: Tests pass
- **WHEN** the CI pipeline reaches the test step
- **THEN** pytest runs and all tests pass with exit code 0

### Requirement: Frontend build verification
The CI pipeline SHALL also verify the frontend builds without errors.

#### Scenario: Frontend build succeeds
- **WHEN** the CI pipeline reaches the frontend build step
- **THEN** `npm run build` in the frontend directory exits with code 0

### Requirement: Docker build verification
The CI pipeline SHALL verify that all Docker images build successfully.

#### Scenario: Docker images build
- **WHEN** the CI pipeline reaches the Docker build step
- **THEN** `docker build` succeeds for both backend and frontend Dockerfiles
