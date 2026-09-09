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

Заготовка под старое ТЗ. В API не используется.

### User

| Поле | Тип | Заметки |
| --- | --- | --- |
| id | Int, PK | |
| login | String, unique |  |
| passwordHash | String | bcrypt |
| role | String, default `user` | пока все новые — `user` |
| createdAt | DateTime | |

Связи с Post/Comment ещё нет (`authorHash` на постах остаётся).

## Миграции

Уже в репозитории: `init`, `add_user`. Применить:

```bash
docker compose exec -T backend npx prisma migrate deploy
docker compose exec -T backend npx prisma db seed
```

Сид идемпотентный: доска `study` и два демо-поста, если лента пустая.
