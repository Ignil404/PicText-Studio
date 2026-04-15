# PicText Studio

Веб-приложение для создания картинок с текстом на шаблонах — галерея шаблонов, canvas-редактор, серверный рендер, история рендеров.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query
- **Backend**: FastAPI + Python 3.12 + Pillow + cairosvg (SVG → PNG)
- **Database**: PostgreSQL + SQLAlchemy (async) + Alembic
- **Cache**: Redis (template list, 600s TTL)
- **Infra**: Docker Compose (4 сервиса)

## Quick Start

```bash
cp .env.example .env
# Generate SECRET_KEY: python -c "import secrets; print(secrets.token_urlsafe(32))"
docker compose up
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_USER` | PostgreSQL username | — |
| `POSTGRES_PASSWORD` | PostgreSQL password | — |
| `POSTGRES_DB` | Database name | — |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |
| `SECRET_KEY` | JWT signing secret | auto-generated if empty |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL | `7` |

- **Новый фронтенд**: http://localhost:5173
- **Старый фронтенд**: http://localhost:5174 (для сравнения)
- **API docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/api/health

## Возможности

- 🎨 Галерея из 15 шаблонов с градиентными фонами и эмодзи-декорациями
- ✏️ Canvas-редактор: текст редактируется в реальном времени на превью
- 🖨️ Серверный рендер через Pillow + cairosvg (SVG data URI → PNG)
- 📜 История рендеров: гостевая (по session ID) + пользовательская (по JWT)
- 🔐 Регистрация/вход через email + пароль, JWT access + refresh tokens
- 👤 Профиль с информацией об аккаунте и счётчиком рендеров
- 🔄 Guest → user migration: гостевые рендеры мигрируют при входе

## Development Commands

| Command | Description |
|---|---|
| `make dev` | Запустить все сервисы |
| `make down` | Остановить все сервисы |
| `make lint` | Ruff + mypy |
| `make format` | Авто-формат backend |
| `make test` | Запустить pytest |
| `make build` | Собрать Docker-образы |

## Архитектура

```
┌──────────────────┐         ┌──────────────────────┐
│   Frontend :5173 │         │     Backend :8000    │
│   React + Vite   │◄──REST──│   FastAPI + Pillow   │
│   Tailwind CSS   │         │   cairosvg (SVG→PNG) │
│   shadcn/ui      │         │                      │
│   Canvas preview │         │  ┌────┐  ┌──────┐   │
└──────────────────┘         │  │ PG │  │Redis │   │
         ▲                   │  └────┘  └──────┘   │
         │                   └──────────────────────┘
   Server render ◄────────────────┘
   Session history ◄────────────┘
```

## Структура проекта

```
├── backend/                  # FastAPI
│   ├── routers/              # endpoints: health, templates, render, history
│   ├── services/             # RenderService (Pillow + cairosvg), TemplateService, CacheService
│   ├── repositories/         # TemplateRepository, RenderHistoryRepository
│   ├── schemas/              # Pydantic: TextZone, TemplateResponse, RenderRequest, HistoryEntry
│   ├── constants.py          # FONT_REGISTRY (18 шрифтов)
│   ├── seeds/                # seed_templates.py (15 шаблонов)
│   ├── alembic/              # миграции БД
│   ├── tests/                # pytest (39 тестов)
│   └── pyproject.toml
├── frontend/                 # React + Vite + Tailwind + shadcn/ui (НОВЫЙ)
│   ├── src/pages/            # Index (галерея), Editor (canvas), History, Auth/Profile (заглушки)
│   ├── src/components/       # CanvasPreview, TemplateCard, EditorPanel, 40+ shadcn/ui
│   ├── src/data/             # templates.ts (15 шаблонов с градиентами и эмодзи)
│   ├── src/hooks/            # useSession (localStorage UUID), useToast
│   ├── src/lib/              # session.ts
│   └── src/types/            # template.ts
├── frontend_old/             # Старый фронтенд (сохранён для сравнения)
├── fonts/                    # 18 .ttf (8 core + 10 Google Fonts)
├── docker-compose.yml        # postgres, redis, backend, frontend, frontend_old
├── Makefile
├── .gitlab-ci.yml            # lint → type-check → test → frontend-build
├── openspec/                 # спецификации и заархивированные изменения
└── report.md                 # ежедневный отчёт
```

## Шрифты

| Категория | Шрифты |
|---|---|
| Core | Roboto, Impact, Arial, Comic Sans, Times New Roman, Courier New, Open Sans |
| Google Fonts | Fredoka, Nunito, Pacifico, Lobster, Caveat, Permanent Marker, Satisfy, Comfortaa, Rubik Mono One, Inter |

## CI/CD

Pipeline (`.gitlab-ci.yml`):
1. **lint** — ruff check + format
2. **type-check** — mypy (с cairosvg deps)
3. **test** — pytest с postgres + redis services
4. **frontend-build** — Vite production build (node:22)
