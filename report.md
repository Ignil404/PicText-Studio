## 2026.04.03: 
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

## 2026-04-09

- Редизайн фронтенда: Tailwind CSS + shadcn/ui, canvas live preview, 15 шаблонов с градиентами
- Серверный рендер: Pillow + cairosvg (SVG data URI → PNG), 10 Google Fonts добавлены
- Страница истории, session UUID вместо Supabase Auth
- 39/39 тестов, CI/CD обновлён, старый фронтенд сохранён как frontend_old
