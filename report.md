## 2026-04-03 

- Создание subgroup, перенос проекта с github

---

## 2026-04-04

- Создан CONSTITUTION.md и CLAUDE.md
- Спланирован скаффолд проекта через OpenSpec
- Начат backend scaffold: FastAPI, SQLAlchemy async, structlog, тесты
- Настроен Git Flow: master + develop + feature/project-scaffold

---

## 2026-04-05

- Завершён скаффолд проекта
- Docker compose: все 4 сервиса healthy (postgres, redis, backend, frontend)
- Смёржена ветка feature/project-scaffold в develop
### Фронтенд
- Frontend scaffold: Vite + React + TypeScript
- Смёржена ветка feature/frontend-scaffold в develop
- Компоненты: TemplateGallery, TemplateCard, Editor, TextLayer, Toolbar, ExportButton
- Экспорт PNG/JPEG через html2canvas

---

## 2026-04-06

- Backend api(termplates, render, history, fonts, routers, schemas)
- Модели БД + Alembic
- 37 тестов(lint, mypy)
- Смёржена ветка feature/backend-api в develop
- Спланирована интеграция фронта в бэк(новая ветка)

---

## 2026-04-07

- Интеграция фронтенд в бэкенд
- Страница истории /history
- Сервер-сайд рендер через POST /api/render, fallback на html2canvas

---

## 2026-04-08

- Анализ UI проекта, выбор визуального направления для редизайна
- Начат редизайн фронтенда

---

## 2026-04-09

- Редизайн фронтенда: Tailwind CSS + shadcn/ui, canvas live preview, 15 шаблонов с градиентами
- Серверный рендер: Pillow + cairosvg (SVG data URI в PNG), 10 Google Fonts добавлены
- Страница истории, session UUID
- Старый фронтенд сохранён как frontend_old

---

## 2026-04-11

- Спланирована система авторизации(на ветке feature/user-auth)

---

## 2026-04-12

- Провёл ревью AGordeenko

---

## 2026-04-13

- Провёл ревью mdragun
- Добавил интеграционные тесты (6 тестов PostgreSQL + Redis)
- Удалил неиспользуемые shadcn/ui компоненты (~40 файлов)

---

## 2026-04-14

- Реализована JWT авторизация (access + refresh токены)
- Backend: User model, 6 auth endpoints, миграции Alembic
- Frontend: AuthProvider, login/register формы, Profile страница
- Guest -> user миграция при логине
- 80 тестов

---

## 2026-04-15

- Заархивирован change `user-auth` — JWT авторизация завершена
- Смержена ветка feature/user-auth в develop
- Спланирована админ-панель

---

## 2026-04-16

- Админ-панель `/admin` — ролевая модель (JWT), управление шаблонами, пользователями, статистика
- Backend: миграции `role` + `is_blocked`, `require_admin()`, 12 admin endpoints
- Frontend: AdminLayout, AdminGuard, Dashboard, Templates CRUD, Users, Stats (4 графика)
- Seed скрипт `create_admin.py` (admin@example.com / admin123)
- 39+ тестов для admin функционала, обновлён README.md

---

## 2026-04-17

- API для создания и получения shared images
- Кнопка "Поделиться" в редакторе
- Публичная страница просмотра /shared/:id
- Удалён frontend_old

