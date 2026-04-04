# Image Text Constructor

Internship project (DL2026 Spring FSD2). A web application for creating text-overlay images.

## Tech Stack

- **Backend**: Python, FastAPI, Pillow
- **Frontend**: Vite SPA (framework TBD)
- **Database**: PostgreSQL (persistent), Redis (cache)
- **Deployment**: Docker Compose

## Status

- [x] Project constitution defined (`CONSTITUTION.md`)
- [x] Project scaffolding planned (`openspec/changes/project-scaffolding/`)
- [ ] Code implementation

## Principles

See [CONSTITUTION.md](CONSTITUTION.md):

- Docker-first deployment
- PostgreSQL for persistent data, Redis for cache only
- Clean frontend/backend separation
- Single Responsibility Principle
- Code quality: ruff + mypy + pytest