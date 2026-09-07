# HTTP API

База: `http://localhost:4000/api`. JSON.

Примеры тел: `Doc/context/examples/`.

## Служебное

| Метод | Путь | Ответ |
| --- | --- | --- |
| GET | `/health` | `{ "status": "ok" }` |

## Доски

| Метод | Путь | Тело | Статус |
| --- | --- | --- | --- |
| GET | `/boards` | — | 200, массив Board |
| POST | `/boards` | `{ slug, title }` | 201 или 400 (slug занят) |

## Посты

| Метод | Путь | Тело | Статус |
| --- | --- | --- | --- |
| GET | `/boards/:slug/posts` | — | 200, посты + comments |
| POST | `/boards/:slug/posts` | `{ title, body, imageUrl?, authorHash? }` | 201 или 404 |
| POST | `/posts/:id/vote` | `{ value: 1 \| -1 }` (любое число: `> 0` = up) | 200, Post |
| POST | `/posts/:id/comments` | `{ body, authorHash? }` | 201, Comment |
| DELETE | `/posts/:id` | — | 204 |

Ошибки пока не унифицированы: где-то `{ error: string }`, где-то необработанный 500 Prisma.
