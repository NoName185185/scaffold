# Инфраструктура

`docker-compose.yml` поднимает три сервиса.

| Сервис | Образ / build | Порт | Роль |
| --- | --- | --- | --- |
| db | postgres:16 | 5432 | БД `forum` / пользователь `forum` / пароль `forum` |
| backend | `./backend` | 4000 | API, volume исходников, `DATABASE_URL` на хост `db`, `JWT_SECRET` |
| frontend | `./frontend` | 5173 | Vite `--host`, `VITE_API_URL=http://localhost:4000/api` |

Том `pgdata` хранит данные Postgres между перезапусками.

## Локальный запуск

См. корневой `README.md`: скопировать `.env.example` → `.env`, `docker compose up --build`. Уже существующие миграции: `docker compose exec -T backend npx prisma migrate deploy`.

Файлы `.env` в git не входят (`.gitignore`).
