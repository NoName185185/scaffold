# Первый локальный срез (backend + frontend)

Проверка плана «этапы 0+1+2, фронт потом»: **так локально нельзя**. После закрытия мутаций и сериализации текущий Vue на `localhost:5173` частично сломается. Первый срез — backend 0–2 **и минимальный frontend**, без полного Vue Router (доски, тред, `/mod` — следующий срез).

Канон: [../context/README.md](../context/README.md). Общий план: [implementation-plan.md](implementation-plan.md).

---

## Что неверно в исходном «сначала только API»

| Решение в общем плане | Что будет на локали |
| --- | --- |
| `POST /vote` + `requireAuth` | `App.vue` шлёт голос без `Authorization` → 401, кнопки ▲▼ мёртвые |
| Сериализация ответа `vote` как голый Post | Сейчас фронт делает `posts[i] = updated`. Если в ответе нет `comments`, счётчик комментариев обнуляется |
| Пост только с `authorId` | `createPost` в клиенте ещё шлёт `authorHash`; формы в UI нет — создать тред с экрана нельзя, проверка анонимности только через curl |
| `JWT_SECRET` только в `.env.example` | В `docker-compose.yml` секрета нет. Сработает, если есть `backend/.env` (volume `./backend:/app` + `dotenv`). Без файла контейнер подпишет JWT `undefined` |
| `npm install` на хосте | У backend/frontend анонимный volume `/app/node_modules`. Пакеты ставить **в контейнере** или `docker-compose up --build` |
| Голос закрыть, фронт отложить | Локальный сценарий «открыл 5173 — потыкал каркас» перестаёт работать |

Итог: API-only первый этап ок для curl, **не ок для docker-compose как продукта**.

---

## Граница первого среза

Входит:

- один PrismaClient;
- `User`, JWT, `authorId` + `isAnonymous`, сериализация;
- закрытые мутации;
- фронт: токен, логин/регистрация, форма поста с чекбоксом, автор или «Аноним», голос с Bearer;
- доска по-прежнему `study` (хардкод).

Не входит: Vue Router, список досок, страница треда, `/mod`, multer, баны, rate-limit, AI.

---

## Backend (локаль)

### Compose / env

В `backend/.env` и в `environment` сервиса `backend`:

- уже есть: `DATABASE_URL`, `CORS_ORIGIN=http://localhost:5173`, `PORT=4000`
- добавить: `JWT_SECRET` (длинная строка, не коммитить реальное значение)

Фронт открывать как **http://localhost:5173**, не `127.0.0.1` — иначе CORS.

`cors` должен пропускать заголовок `Authorization` (у пакета `cors` по умолчанию отражается preflight — не сужать `allowedHeaders`).

### Пакеты (в контейнере)

```text
docker-compose exec backend npm install bcryptjs jsonwebtoken
```

Импорт ESM: `import jwt from 'jsonwebtoken'` / `import bcrypt from 'bcryptjs'` — проверить после установки (у `jsonwebtoken` иногда нужен `default`).

### Схема (одна миграция)

- Удалить `Moderator`.
- `User`: `login`, `passwordHash`, `role` default `"user"`.
- `Post` / `Comment`: убрать `authorHash`; `authorId` → User; `isAnonymous` default `true`.
- `onDelete` для комментариев при удалении поста: `Cascade` (иначе `DELETE` поста упадёт).

```text
docker compose exec -T backend npx prisma migrate dev --name auth_and_anonymous
```

Сиды (скрипт или Studio): пользователь `admin` / `user`, доска `study`. Без доски лента пустая; без admin нельзя создать доску через API.

### Файлы

| Путь | Роль |
| --- | --- |
| `src/db.js` | один клиент |
| `src/middleware/attachUser.js` | опциональный JWT → `req.user` |
| `src/middleware/requireAuth.js` | 401 |
| `src/middleware/requireRole.js` | 403 |
| `src/lib/serialize.js` | пост + вложенные комментарии |
| `src/routes/auth.js` | register / login / me |
| `index.js` | `attachUser` на `/api`, затем роуты |

### Контракт API этого среза

| Метод | Auth | Заметки |
| --- | --- | --- |
| `GET /health`, `GET /boards`, `GET /boards/:slug/posts` | нет | лента через serialize; `include` author+comments.author в Prisma, в JSON author только по правилам |
| `POST /auth/register` `{ login, password }` | нет | всегда `role=user`; слабый пароль можно отвергать позже |
| `POST /auth/login` | нет | `{ token, user: { id, login, role } }` |
| `GET /auth/me` | Bearer | |
| `POST /boards` | admin | |
| `POST /boards/:slug/posts` | любой залогиненный | тело: `title`, `body`, `isAnonymous?` (default true). `authorId` только из `req.user.id` |
| `POST /posts/:id/comments` | залогиненный | `body`, `isAnonymous?` |
| `POST /posts/:id/vote` | залогиненный | ответ — **тот же serialize, что у ленты** (с `comments`), иначе фронт сотрёт счётчик |
| `DELETE /posts/:id` | moderator \| admin | каскад комментариев |

Ошибки: 401 без токена, 403 роль/не тот пользователь не нужен на пост, 400 валидация login/title.

### Локальная проверка API

1. `GET http://localhost:4000/api/health`
2. register + login → token
3. без token `POST` поста → 401
4. с token пост `isAnonymous: true` → в GET ленты нет `author`
5. login admin → в GET ленты у того же поста `author` есть
6. vote без token → 401; с token → карточка не теряет `comments`

---

## Frontend (локаль, минимум)

Пакеты: **`vue-router` в этом срезе не обязателен.** Axios уже есть.

У фронта тоже anonymous `node_modules`: новые пакеты не нужны, если router откладываем.

### Файлы

| Путь | Роль |
| --- | --- |
| `src/api/client.js` | interceptor: `localStorage.token` → `Authorization: Bearer`; хелперы `register`, `login`, `me`; `createPost` без `authorHash`, с `isAnonymous` |
| `src/App.vue` | блок войти/регистрация/выйти; если токен есть — `PostForm`; лента `study` |
| `src/components/PostForm.vue` | title, body, чекбокс анонимности (вкл. по умолчанию) |
| `src/components/PostCard.vue` | если `post.author` — login, иначе «Аноним»; голос как сейчас |

`VITE_API_URL=http://localhost:4000/api` в compose уже есть. Vite подхватывает при старте контейнера. Менять URL — перезапуск frontend.

Голос: при 401 показать «войдите», не затирать пост `undefined`.

После vote мержить в существующий объект (`upvotes`/`downvotes`) **или** полагаться на полный serialize с `comments` (предпочтительно бэкенд).

### Локальная проверка UI

1. `docker-compose up` → http://localhost:5173 лента (может быть пустой)
2. Регистрация → токен в Application → Local Storage
3. Форма поста → тред в ленте без имени
4. Выйти → голос предлагает войти
5. Войти тем же пользователем → голос меняет цифру, комментарии не пропадают
6. Войти admin (сид) → на анонимном посте видно login

---

## Порядок команд локально

```text
# env
cp backend/.env.example backend/.env   # + JWT_SECRET
cp frontend/.env.example frontend/.env

docker-compose up --build

docker-compose exec backend npm install bcryptjs jsonwebtoken
docker compose exec -T backend npx prisma migrate dev --name auth_and_anonymous
# сид admin + board study
```

После смены `schema.prisma` / `package.json` — migrate и install в **том же** backend-контейнере, не с хоста (хостовый Prisma смотрит на `localhost`, URL в `.env.example` — хост `db`, с Windows без compose не резолвится).

---

## Критерий готовности первого среза

- Compose: 5173 + 4000 + Postgres.
- С браузера: регистрация, анонимный пост, автор скрыт, голос после логина.
- С admin JWT: автор виден (Network или UI).
- Без JWT пост/голос — 401.
- Каркасная лента не деградирует из‑за пустого `comments` после vote.
