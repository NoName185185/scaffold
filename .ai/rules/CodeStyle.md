# Стиль кода (RUBA AI OS backend)

Источник истины — `backend/ruff.toml`: line-length 100, target py312, правила `E, F, I, UP` (E501 игнорируется).

## Обязательно

- Полные аннотации типов в сигнатурах функций (параметры и возврат). Современный синтаксис: `str | None`, `list[dict]`, `dict[str, Any]`.
- SQLAlchemy 2.0-стиль: `Mapped[...]` + `mapped_column(...)`, запросы через `select()`, не legacy `query()`.
- Pydantic v2: `model_config`, `model_validate`, `model_dump` (не `.dict()` / `.parse_obj()`).
- Импорты отсортированы (ruff I). Абсолютные импорты от `app.`: `from app.services.llm.client import ...`.
- Именование: snake_case для функций/переменных, PascalCase для классов, UPPER_CASE для констант.
- Логирование через `logging.getLogger(__name__)`, не `print`.

## Запрещено

- Комментарии, пересказывающие код. Комментарий — только для неочевидного «почему».
- Абстракции «на будущее» (интерфейсы с одной реализацией, фабрики без нужды, конфиг-флаги под гипотетические сценарии). Реализуй ровно то, что в спеке.
- Голый `except Exception: pass`. Ошибка либо обрабатывается осмысленно, либо пробрасывается.
- Хардкод секретов и URL — всё в `Settings` (`app/config.py`).

## Проверка перед сдачей

```bash
cd backend
ruff check .
ruff check --fix .   # автофикс, затем повторить проверку
```
