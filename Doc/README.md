# Документация проекта

Здесь живут контекст, спеки, описание реализации и журнал разработки.
Код — в `backend/`, `frontend/` и `docker-compose.yml`. Этот каталог — для людей и агентов, которые продолжают работу.

**Контекст продукта (канон):** [context/README.md](context/README.md) — синтез `ProjectOld.md` и `ProjectNew.md`. Черновики ТЗ в `implementation/` не перебивают его.

## Карта папок

| Папка | Назначение |
| --- | --- |
| [context/](context/README.md) | Контекст проекта; скриншоты, примеры, референсы |
| [implementation/](implementation/README.md) | Как устроено сейчас: API, БД, фронт, Docker |
| [specs/](specs/README.md) | Требования, архитектура, [план реализации](specs/implementation-plan.md), роадмап |
| [changelog/](changelog/CHANGELOG.md) | Версии и пользовательски заметные изменения |
| [dev-log/](dev-log/README.md) | Дневник сессий: что сделали, почему, что осталось |

## Как писать дальше

- Новый фича-спек — файл в `specs/` (например `specs/auth-moderators.md`).
- Изменили поведение API или схемы — обновите `implementation/` в том же PR/сессии.
- Скрин или пример запроса — в `context/images/` или `context/examples/`, ссылка из спека.
- Конец сессии — короткая запись в `dev-log/` с датой.
- Релиз или осмысленный срез — пункт в `changelog/CHANGELOG.md`.

## Стек (кратко)

University Board: университетский борда с **публичной** анонимностью (скрытие автора в API) и аккаунтами в БД.

- Backend: Node.js, Express, Prisma, PostgreSQL
- Frontend: Vue 3, Vite, Axios
- Запуск: Docker Compose
