# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

- **Name**: DL2026_Spring_FSD2_Buslovich
- **Remote**: https://gitlab.12devs.com/training/internship/2026_dl_spring/ibuslovich/dl2026_spring_fsd2_buslovich
- **Status**: Greenfield — no application code exists yet. This is a 2026 spring internship project (FSD2).
- **Tech stack**: Not yet determined. Python is the working directory context; stack will be decided as the project develops.

## Workflow: OpenSpec

This project uses the `spec-driven` workflow via OpenSpec (`openspec/config.yaml`). When building features, use the OpenSpec skills:

- `opsx:propose` — propose a new change (design + specs + tasks generated in one step)
- `opsx:explore` — think through ideas and investigate problems before committing
- `opsx:apply` — implement tasks from an OpenSpec change
- `opsx:archive` — archive a completed change

OpenSpec specs live under `openspec/specs/` and changes under `openspec/changes/`.

## Tech Stack (decided)
- Frontend: React 18 + Vite + TypeScript + HTML/CSS overlay editor + html2canvas
- Backend: FastAPI + Python 3.12 + Pillow (image rendering)
- DB: PostgreSQL + SQLAlchemy (async) + Alembic migrations
- Cache: Redis — only for GET /api/templates, TTL 600s
- Infra: Docker + docker-compose (mandatory, per CONSTITUTION.md)
- Canvas rendering: HTML/CSS divs overlay + html2canvas for export (MVP)
- Fonts: 8 bundled .ttf fonts, mapped by name in DB

## Development Commands (to be added after scaffold)
- `docker compose up` — start all services
- `docker compose run backend alembic upgrade head` — run migrations

## Key Decisions (from opsx:explore)
- Server-side render via Pillow, not client-only export
- Session-based history (no auth in MVP)
- 8 fixed fonts in /fonts volume, synced client/server

## Active Skills
- backend-patterns
- docker-patterns  
- api-design
- deployment-patterns