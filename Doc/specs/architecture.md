# Архитектура (целевая)

Снимок кода: `Doc/implementation/`. План внедрения слоёв: [implementation-plan.md](implementation-plan.md).

## Границы

- **frontend** — SPA, только HTTP к `/api`, JWT в заголовке
- **backend** — REST, auth, сериализация анонимности, позже файлы и AI
- **db** — источник правды; автор поста всегда как `User`
- **AI** — внешний HTTP (Ollama/OpenRouter), не в критическом пути публикации

## Слои backend

1. `db.js` — один PrismaClient
2. Роуты — HTTP и коды
3. Middleware — `attachUser`, `requireAuth`, `requireRole`, позже rate-limit
4. `lib/serialize*` — скрытие `author` при `isAnonymous`, исключение moderator/admin
5. Позже: баны перед create, опциональный AI-роут

Модель `Moderator` не целевая. Целевая: `User.role`.

## Файлы

Сначала диск `backend/uploads` + static `/uploads`. S3 — только если диск уже есть и это явно нужно.

## Фронт

Vue Router: `/`, `/b/:slug`, `/b/:slug/:postId`, `/login`, `/register`, `/mod`.
