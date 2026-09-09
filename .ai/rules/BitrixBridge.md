# Правило: версия PHP-моста Битрикс

Файл моста: `bitrix/public/local/components/ruba/api/product.php`.

Формат: `BRIDGE_VERSION` — semver `MAJOR.MINOR.PATCH` (например `0.4.0`); `BRIDGE_VERSION_DATE` — `YYYY-MM-DD`.

## Обязательный bump

При **любом смысловом** изменении этого файла агент/разработчик **обязан** bump’нуть версию моста по политике из `.ai/rules/ComponentVersions.md`:

1. **PATCH** — сам (`PATCH + 1`) и обновить дату.
2. **MINOR** — спросить человека (новая фича).
3. **MAJOR** — только человек.

Отдельный changelog в шапке PHP не ведётся — причину bump фиксировать в `DevLog.md` фичи.

Косметика только в комментариях без смены поведения — bump не обязателен; при сомнении — PATCH.

## Ревью

Дифф `product.php` без изменения `BRIDGE_VERSION` / `BRIDGE_VERSION_DATE` → **CHANGES_REQUESTED**.

Автотесты проверяют наличие констант и формат semver в health; они **не** решают, «нужно ли было поднимать» — это только ревью.
