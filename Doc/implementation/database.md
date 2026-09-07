# База данных

Схема: `backend/prisma/schema.prisma`. Провайдер: PostgreSQL, URL из `DATABASE_URL`.

## Модели

### Board

| Поле | Тип | Заметки |
| --- | --- | --- |
| id | Int, PK | autoincrement |
| slug | String, unique | URL-имя доски, например `study` |
| title | String | человекочитаемое имя |
| posts | Post[] | |

### Post

| Поле | Тип | Заметки |
| --- | --- | --- |
| id | Int, PK | |
| boardId | Int | FK на Board |
| title, body | String | |
| imageUrl | String? | пока только URL, не файл |
| authorHash | String? | анонимный идентификатор с клиента |
| upvotes, downvotes | Int, default 0 | |
| createdAt | DateTime | now() |
| comments | Comment[] | |

### Comment

| Поле | Тип | Заметки |
| --- | --- | --- |
| id | Int, PK | |
| postId | Int | FK на Post |
| body | String | |
| authorHash | String? | |
| createdAt | DateTime | |

### Moderator

Заготовка под будущий auth: `login` unique, `passwordHash`, `role` (`moderator` \| `admin`). В API не используется.

## Миграции

После первого `docker-compose up`:

```bash
docker-compose exec backend npx prisma migrate dev --name init
```

Пока в репозитории может не быть готовой папки `prisma/migrations` — применяйте миграцию при первом запуске и коммитьте результат.
