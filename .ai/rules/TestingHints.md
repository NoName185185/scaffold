# Тестирование (RUBA AI OS backend)

Фреймворк: pytest (конфиг `backend/pytest.ini`). Тесты в `backend/tests/`, файлы `test_*.py`.

## Принципы

- Тестируем `services/` и `api/` — то, что описано в спеке фичи. Не тестируем SQLAlchemy/FastAPI сами по себе.
- Один тест — одно поведение. Имя описывает сценарий: `test_create_task_returns_queued_status`.
- Внешние зависимости мокаем всегда:
  - LLM (OpenAI) — мок клиента, фиксированные ответы;
  - Redis — мок или fakeredis;
  - HTTP к PHP-мосту Битрикса — `httpx.MockTransport` или respx;
  - парсинг сайтов — сохранённые HTML-фикстуры в `tests/fixtures/`.
- БД в тестах: SQLite in-memory или мок сессии — не требовать поднятой MariaDB.
- API-тесты через `fastapi.testclient.TestClient`.

## Обязательный минимум на фичу

1. Happy path каждой публичной функции сервиса.
2. Ключевые ошибки: внешняя система недоступна, невалидный вход, пустой результат.
3. Для Celery-тасок — вызов таски напрямую (task.run/apply), брокер не нужен.

## Запуск

```bash
cd backend
pytest -q
```

Все тесты должны проходить локально без Docker и без сети.
