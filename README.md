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
- 🛡️ **Админ-панель** (`/admin`) — управление шаблонами, пользователями, статистика
- 📊 **Stats кэширование** — Redis (5 мин TTL) для админ-эндпоинтов

## Development Commands

| Command | Description |
|---|---|
| `make dev` | Запустить все сервисы |
| `make down` | Остановить все сервисы |
| `make lint` | Ruff + mypy |
| `make format` | Авто-формат backend |
| `make test` | Запустить pytest |
| `make build` | Собрать Docker-образы |

## Database Migrations

Alembic миграции в `backend/alembic/versions/`:

- `007_add_user_role` — колонка role для пользователей
- `008_add_user_blocked` — колонка is_blocked + индекс
- `009_add_template_is_active` — колонка is_active для шаблонов
- `009_alter_role_to_string` — изменение типа role на строку

## Админ-панель

Административный интерфейс доступен по пути `/admin` для пользователей с ролью `admin`.

### Функции админ-панели

- **Dashboard** — обзорная статистика: рендеры за 7 дней, общее количество пользователей и шаблонов
- **Templates** — управление шаблонами: создание, редактирование, удаление
- **Users** — управление пользователями: просмотр списка, блокировка/разблокировка, детальная информация
- **Statistics** — аналитика: графики рендеров по дням, популярные шаблоны, активность пользователей

### Настройка администратора

1. Создайте первого администратора:
```bash
cd backend
python seeds/create_admin.py
```

По умолчанию создаётся пользователь: `admin@example.com / admin123`

2. Измените пароль после первого входа через профиль пользователя.

### API Admin Endpoints

Все endpoints требуют JWT токен с ролью `admin`:

| Endpoint | Описание |
|----------|----------|
| `GET /api/admin/stats/dashboard` | Обзорная статистика |
| `GET /api/admin/templates` | Список шаблонов (пагинация, поиск, фильтр по status) |
| `POST /api/admin/templates` | Создание шаблона |
| `PUT /api/admin/templates/{id}` | Обновление шаблона |
| `DELETE /api/admin/templates/{id}` | Удаление шаблона (soft delete) |
| `PATCH /api/admin/templates/{id}/activate` | Активация шаблона |
| `PATCH /api/admin/templates/{id}/deactivate` | Деактивация шаблона |
| `GET /api/admin/users` | Список пользователей |
| `GET /api/admin/users/{id}` | Детальная информация о пользователе |
| `POST /api/admin/users/{id}/block` | Блокировка пользователя |
| `POST /api/admin/users/{id}/unblock` | Разблокировка пользователя |
| `GET /api/admin/stats/renders` | Рендеры по дням |
| `GET /api/admin/stats/popular-templates` | Популярные шаблоны |
| `GET /api/admin/stats/user-activity` | Активность пользователей |

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
│   ├── routers/              # endpoints: auth, templates, render, history, admin
│   ├── services/             # RenderService, TemplateService, CacheService, AuthService
│   ├── repositories/         # TemplateRepository, RenderHistoryRepository, UserRepository
│   ├── schemas/              # Pydantic models
│   ├── dependencies.py       # require_admin, get_current_user
│   ├── constants.py          # FONT_REGISTRY (18 шрифтов)
│   ├── seeds/                # seed_templates.py, create_admin.py
│   ├── alembic/              # миграции БД
│   ├── tests/                # pytest (70+ тестов)
│   └── pyproject.toml
├── frontend/                 # React + Vite + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── pages/            # Index, Editor, History, Profile, admin/*
│   │   ├── components/       # CanvasPreview, TemplateCard, EditorPanel, admin/*
│   │   ├── components/ui/     # shadcn/ui компоненты
│   │   ├── data/             # templates.ts (15 шаблонов)
│   │   ├── hooks/            # useAuth, useSession
│   │   ├── lib/              # api client
│   │   └── types/            # TypeScript типы
│   └── src/pages/admin/      # AdminDashboard, AdminTemplates, AdminUsers, AdminStats
├── frontend_old/             # Старый фронтенд
├── fonts/                    # 18 .ttf шрифтов
├── docker-compose.yml       # postgres, redis, backend, frontend
├── Makefile
├── .gitlab-ci.yml
├── openspec/                 # спецификации changes
└── report.md
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
