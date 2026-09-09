# Архитектура backend (RUBA AI OS)

Стек: Python 3.12 · FastAPI · SQLAlchemy 2.0 · Celery · Redis · MariaDB · Pydantic v2.

## Слои и зависимости

```
app/
├── api/routes/    # HTTP-эндпоинты. Только: валидация входа (schemas) → вызов services → ответ
├── schemas/       # Pydantic DTO. Без бизнес-логики
├── services/      # Доменная логика. НЕ импортирует api/. Может использовать models/, db/
│   ├── search/    # Поиск данных о товаре (collector: парсеры + LLM fallback)
│   ├── properties/# Подбор свойств: match + required + validate_by_type
│   ├── llm/       # call_llm + типизированные ошибки + кэш (Redis → MariaDB llm_cache)
│   ├── seo/       # Механические SEO-проверки + LLM-ревью
│   └── bitrix/    # HTTP-клиент PHP-моста + schema helpers (labels / get_properties)
├── models/        # SQLAlchemy ORM (Mapped/mapped_column, стиль 2.0)
├── workers/       # Celery-таски. Оркестрируют вызовы services, сами логику не содержат
├── db/            # engine, SessionLocal, Base
└── config.py      # Settings (pydantic-settings), доступ через get_settings()
```

Правила зависимостей:

- `api → services → models/db` — только в эту сторону. services не знает про FastAPI.
- Celery-таски (`workers/`) — тонкие: получают id, открывают сессию, вызывают services, обновляют статус.
- Настройки только через `get_settings()`, никаких `os.environ` в коде.
- Статусы задач — enum `TaskStatus` (`app/models/enums.py`): `queued → searching → normalizing → generating → seo_check → draft_ready | failed`.

## Границы изменений

- Новая функциональность = новый модуль в `services/` или расширение существующего. Не смешивать домены (поиск не знает про SEO).
- Схема БД меняется через модель + миграцию Alembic (`backend/alembic/`).
- Интеграция с Битриксом — только через `services/bitrix/client.py` и PHP-мост. Никаких прямых запросов к БД Битрикса.
- UI — **отдельный контейнер `webapp`** (nginx): собирает и отдаёт Vue 3 + Vite + TypeScript SPA и проксирует `/api/*` на контейнер `api` (same-origin cookie-сессия). Бэкенд `api` SPA **не отдаёт** (`GET /` — служебный ответ, не UI). Клиент общается только через `/api/*` с `credentials: 'include'`. RBAC: `app/rbac/permissions.py` + `require_permissions` / `require_roles`. Admin: users + settings; operator: tasks write; viewer: `/statuses`. `backend/static` — историческая заглушка, не UI.
