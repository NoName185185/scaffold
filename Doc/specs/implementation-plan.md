# План реализации недостающего

Канон продукта: [Doc/context/README.md](../context/README.md). Этот файл — очередь работ по коду: что нет в каркасе, в каком порядке делать, какие файлы трогать.

Правило сессии: один этап → короткий план в чате (если что-то уточнилось) → код → запись в `dev-log/` → правки `implementation/`. Не смешивать AI и капчу с auth.

Каркас уже даёт Compose, CRUD досок/постов/голосов/комментов и ленту `/study/`. Ниже — только пробелы.

---

## Целевая нарезка репозитория

Стек и три сервиса не меняем. Добавляем слои внутри backend/frontend.

```
backend/src/
  index.js
  db.js                 # один PrismaClient
  middleware/
    attachUser.js       # JWT опционально → req.user
    requireAuth.js
    requireRole.js
    rateLimit.js        # этап 7
  lib/
    serializePost.js    # скрытие author при isAnonymous
    serializeComment.js
  routes/
    auth.js
    boards.js
    posts.js
    moderation.js       # этап 6
    ai.js               # этап 8
  uploads/              # этап 5, gitignore содержимого

frontend/src/
  main.js               # Vue Router + token
  App.vue               # layout: навигация, кто вошёл
  api/client.js         # Authorization: Bearer
  router/index.js
  views/
    BoardList.vue
    BoardFeed.vue
    Thread.vue
    Login.vue
    Register.vue
    ModPanel.vue
  components/
    PostCard.vue
    PostForm.vue
    CommentForm.vue
```

`Moderator` в Prisma **удаляем**. Роли — поле `User.role`: `user` | `moderator` | `admin`.

---

## Этап 0 — фундамент (маленький, первым)

Зачем: не плодить PrismaClient в каждом роутере.

| Файл | Действие |
| --- | --- |
| `backend/src/db.js` | `export const prisma = new PrismaClient()` |
| `boards.js`, `posts.js` | импорт из `db.js` |

Критерий: API как сейчас, но клиент один.

---

## Этап 1 — пользователи и JWT

Зачем: без сессии нельзя постить; модерация и админка на тех же аккаунтах.

### Схема

Заменить `Moderator` на:

```
User
  id, login unique, passwordHash
  role String default "user"   // user | moderator | admin
  createdAt
  posts Post[]
  comments Comment[]
```

На этом этапе Post/Comment ещё можно оставить с `authorHash` **или** сразу перейти к этапу 2 в одной миграции (предпочтительно: **1+2 одной миграцией**, чтобы не мигрировать дважды пустой каркас). Если в БД уже есть данные — сначала 1, потом 2. Для чистого scaffold: **одна миграция на этапы 1–2**.

### Зависимости и env

- npm: `bcryptjs`, `jsonwebtoken`
- `backend/.env.example` + compose: `JWT_SECRET`

### Код

| Файл | Действие |
| --- | --- |
| `routes/auth.js` | `POST /api/auth/register` `{ login, password }` → 201, без авто-admin |
| | `POST /api/auth/login` → `{ token, user: { id, login, role } }` |
| | `GET /api/auth/me` + `requireAuth` |
| `middleware/attachUser.js` | если `Authorization: Bearer`, проверить JWT, `req.user`; иначе `req.user = null` |
| `requireAuth.js` | нет пользователя → 401 |
| `requireRole.js` | `requireRole('moderator','admin')` |
| `index.js` | `attachUser` на всё API, смонтировать `/api/auth` |

Первого admin создать сидом или разовой командой Prisma (логин в dev-log, не в git как пароль). Обычный register всегда `role=user`.

### Закрыть дыры каркаса (минимум)

Уже на этапе 1–2:

- `POST /api/boards` — только `admin`
- `DELETE /api/posts/:id` — `moderator` или `admin`
- `POST` поста/комментария — `requireAuth`

Голос: тоже `requireAuth` (иначе анонимный накрут). Уникальность голоса — этап 6.

Критерий: регистрация/логин работают; без токена мутации 401; доску создаёт только admin.

---

## Этап 2 — анонимность в данных и API

Зачем: канон — `authorId` в БД, скрытие в JSON.

### Схема Post и Comment

- убрать `authorHash`
- `authorId` FK → User (обязательный)
- `isAnonymous Boolean default true`

### Сериализация

`lib/serializePost.js` / `serializeComment.js`:

- в объект всегда: id, контент, голоса, даты, `isAnonymous`, комментарии (для поста)
- поле `author: { id, login }` **только если** `!isAnonymous` **или** `req.user.role` ∈ `{ admin }`  
  (модератору тоже отдавать автора — иначе жалобы слепые; в каноне «admin, при необходимости moderator» → **отдаём moderator и admin**)
- публике и автору-не-админу при `isAnonymous=true` поля `author` нет

Все `GET` ленты/треда и ответы `POST` идут через сериализатор. В БД сырой `include: { author: true }` можно, наружу — нет.

Критерий: в Prisma Studio автор виден; в DevTools у анонимного поста нет `author`; под JWT admin — есть.

---

## Этап 3 — фронт: auth, доски, формы

Зачем: закрыть хардкод `study` и дать чекбокс анонимности.

Зависимость: `vue-router`. Токен: `localStorage`, axios interceptor.

| Маршрут | Экран |
| --- | --- |
| `/login`, `/register` | формы |
| `/` | список досок |
| `/b/:slug` | лента + `PostForm` (если вошёл) |
| `/b/:slug/:postId` | тред + комментарии + `CommentForm` |
| `/mod` | заглушка до этапа 6, `beforeEnter` по role |

Поведение:

- шапка: login / выйти / роль
- `PostForm`: title, body, `isAnonymous` (по умолчанию включён)
- `PostCard`: автор только если пришёл с API; иначе «аноним»
- голосование и пост без токена — кнопка ведёт на `/login`

Критерий: пользователь регистрируется, пишет анонимный тред, в ленте без имени; admin в том же UI видит login (потому что API отдал).

---

## Этап 4 — страница треда и комментарии в UI

Можно совместить с этапом 3, если объём небольшой. Иначе сразу после форм.

- открыть пост по id, список комментариев, форма ответа с тем же `isAnonymous`
- `GET` одного поста, если ещё нет: `GET /api/posts/:id`

Критерий: ветка обсуждения без консоли/curl.

---

## Этап 5 — изображения

- `multer`: jpeg/png/webp/gif, лимит размера (например 5 МБ)
- диск `backend/uploads`, volume в compose
- `POST /api/posts` как `multipart` **или** отдельный `POST /api/uploads` → `{ url }`, в пост кладётся `imageUrl`
- Express: `app.use('/uploads', express.static(...))`
- фронт: превью в форме и в карточке
- `.gitignore` на файлы, не на папку

S3 не делать, пока диск не заработает (учебный объём).

Критерий: тред с картинкой открывается с фронта.

---

## Этап 6 — модерация

### Схема

```
Ban
  id, userId, reason, createdById, createdAt, expiresAt?

Report
  id, postId?, commentId?, reporterId, reason, status, createdAt
```

Опционально `Vote` `(userId, postId, value)` unique — один голос на пост, смена голоса через update. Иначе накрут после логина останется.

### API (все за `requireRole`)

- удаление комментария
- `POST /api/mod/bans` , `DELETE /api/mod/bans/:userId`
- `POST /api/reports` — любой авторизованный
- `GET /api/mod/reports` — мод/админ
- пост/коммент от забаненного → 403

Проверка бана в `requireAuth` или перед create post/comment.

### Фронт `/mod`

Список жалоб, удалить, бан. Кнопка «пожаловаться» на карточке.

Критерий: мод банит пользователя; тот не постит; в ленте пост исчезает после удаления.

---

## Этап 7 — безопасность

- `express-rate-limit` на `POST` постов/комментов/auth (разные окна)
- капча на создание треда: для диплома достаточно простого challenge (математика/поле-honeypot + серверная проверка) или Turnstile, если появится ключ; не блокировать этап 1–6 ожиданием внешней капчи
- XSS: не `v-html` сырой body; при необходимости санитизация на бэке перед сохранением
- не логировать IP как id автора; JWT secret не в репозитории
- ручных SQL fragment в Prisma не добавлять без ревью

Критерий: пачка POST с одного клиента получает 429; в шаблонах нет сырого HTML из body.

---

## Этап 8 — AI-модерация (после ядра)

- `backend/src/routes/ai.js`: `POST /api/ai/moderate` `{ text }` → `{ verdict: "ok" | "toxic", source }`
- HTTP к Ollama и/или OpenRouter; ключи в env
- **не** вставлять вызов в `POST /posts` как обязательный: таймаут/падение AI → постинг жив
- опционально: мод видит вердикт на жалобе; или фоновый вызов после создания поста, пишем в поле `Post.moderationFlag?` (добавить колонку только здесь)

Критерий: роут отвечает на фикстуре; выключенный Ollama не ломает создание треда.

---

## Этап 9 — документация и проверка под SRS

Не фича продукта, но часть «нужного»:

- обновить `implementation/*` и ERD-схему в `context/images/`
- changelog
- минимальные проверки: health, register, anonymous hide, admin sees author, 401 без токена (скрипт curl или несколько тестов)

Критерий: по `Doc/` можно восстановить архитектуру без чтения всего кода.

---

## Порядок и зависимости

```
0 db.js
    → 1+2 auth + схема User/authorId/isAnonymous + закрыть мутации
        → 3+4 фронт router, формы, тред
            → 5 картинки
            → 6 баны/жалобы/голоса unique + /mod
                → 7 rate-limit / капча / XSS
                    → 8 AI
                        → 9 SRS-доки
```

Не начинать 5–8, пока нет сериализации и логина: иначе придётся переписывать формы и multer под anonymous дважды.

---

## Вне скоупа этого плана

SSO вуза, микросервисы, очереди, отдельный контейнер AI, мобильные клиенты, production S3 «сразу».

---

## Как брать в работу

Следующий практический шаг после этого документа: **этапы 0+1+2 одной сессией** (фундамент, User, JWT, сериализация, закрытые роуты). Фронт — следующая сессия.
