# Инфраструктура

`docker-compose.yml` поднимает три сервиса.

| Сервис | Образ / build | Порт | Роль |
| --- | --- | --- | --- |
| db | postgres:16 | 5432 | БД `forum` / пользователь `forum` / пароль `forum` |
| backend | `./backend` | 4000 | API, volume исходников, `DATABASE_URL` на хост `db` |
| frontend | `./frontend` | 5173 | Vite `--host`, `VITE_API_URL=http://localhost:4000/api` |

Том `pgdata` хранит данные Postgres между перезапусками.

## Локальный запуск

См. корневой `README.md`: скопировать `.env.example` → `.env`, `docker-compose up --build`, затем Prisma migrate.

Файлы `.env` в git не входят (`.gitignore`).
