# University Board — каркас проекта

Backend: Node.js (Express) + Prisma + PostgreSQL
Frontend: Vue 3 + Vite
Инфраструктура: Docker Compose

Документация, спеки, примеры и dev-log: каталог [`Doc/`](Doc/README.md). Контекст продукта: [`Doc/context/README.md`](Doc/context/README.md).

## Структура

```
.
├── backend/          # Express API
│   ├── prisma/schema.prisma
│   └── src/
├── frontend/         # Vue 3 SPA
│   └── src/
└── docker-compose.yml
```

## Запуск

1. Скопировать переменные окружения:
   ```
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Поднять всё разом:
   ```
   docker-compose up --build
   ```

3. Применить миграции БД (в отдельном терминале, пока контейнеры работают):
   ```
   docker-compose exec backend npx prisma migrate dev --name init
   ```

4. Открыть:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api/health
   - Prisma Studio (визуальный просмотр БД): `docker-compose exec backend npx prisma studio`

## Создать первую доску (вручную через curl, пока нет админки)

```
curl -X POST http://localhost:4000/api/boards \
  -H "Content-Type: application/json" \
  -d '{"slug": "study", "title": "Учёба"}'
```

## Дальнейшие шаги развития

- [ ] Авторизация модераторов (JWT + bcrypt, модель Moderator уже в schema.prisma)
- [ ] Загрузка изображений (multer + сохранение в /uploads или S3-совместимое хранилище)
- [ ] Rate-limiting постинга (express-rate-limit)
- [ ] Модуль AI (Ollama/OpenRouter) — например, отдельный роут /api/ai/moderate,
      который перед публикацией поста проверяет текст на токсичность
- [ ] Панель модератора во фронтенде (удаление постов, баны по authorHash)
