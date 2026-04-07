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