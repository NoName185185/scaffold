# Backend

Корень: `backend/`. ESM (`"type": "module"`). Точка входа: `backend/src/index.js`.

## Стек

- Express 4, `cors`, `dotenv`
- Prisma Client + PostgreSQL
- Dev: `node --watch src/index.js`

## Загрузка приложения

1. CORS: `CORS_ORIGIN` или `http://localhost:5173`
2. `express.json()`
3. `GET /api/health` → `{ status: "ok" }`
4. ` /api/boards` → `routes/boards.js`
5. `/api` → `routes/posts.js` (посты, голоса, комментарии)

Отдельного слоя сервисов нет: роуты ходят в Prisma напрямую. В каждом роутере создаётся свой `PrismaClient` — для каркаса нормально, при росте лучше вынести один клиент.

## Роуты досок (`boards.js`)

- `GET /` — все доски
- `POST /` — `{ slug, title }`; конфликт slug → 400 `{ error: "Board with this slug already exists" }`

Авторизации нет: создать доску может любой, у кого есть URL.

## Роуты постов (`posts.js`)

- `GET /boards/:slug/posts` — посты доски, `comments` включены, новые сверху
- `POST /boards/:slug/posts` — доска не найдена → 404
- `POST /posts/:id/vote` — `value > 0` увеличивает `upvotes`, иначе `downvotes`. Повторные голоса и «свой голос» не учитываются
- `POST /posts/:id/comments`
- `DELETE /posts/:id` — 204, без auth

Валидации title/body почти нет. Удаление поста не описывает каскад комментариев явно в роуте: поведение задаёт Prisma/БД.

## Скрипты (`package.json`)

- `dev` / `start`
- `prisma:migrate`, `prisma:studio`
