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
- Смёржена ветка feature/project-scaffold → develop
### Фронтенд
- Frontend scaffold: Vite + React + TypeScript
- Компоненты: TemplateGallery, TemplateCard, Editor, TextLayer, Toolbar, ExportButton
- Экспорт PNG/JPEG через html2canvas