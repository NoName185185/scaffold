# Роадмап

Детальный план файлов и критериев: [implementation-plan.md](implementation-plan.md). Канон продукта: [../context/README.md](../context/README.md).

## Сейчас (каркас)

- [x] Docker Compose: db + API + Vite
- [x] Prisma: Board, Post, Comment, Moderator (устареет на этапах 1–2)
- [x] CRUD-минимум постов и досок (мутации пока открыты всем)
- [x] Лента одной доски во фронте + голоса

## Очередь

| Этап | Содержание | Статус |
| --- | --- | --- |
| Auth + лента | User, JWT, UI регистрация/вход, публичная лента `study` | сделано |
| 0+1+2 остаток | `authorId` / `isAnonymous`, форма поста, закрыть мутации — [first-slice-local.md](first-slice-local.md) | не начат |
| 3+4 | Vue Router, список досок, тред (формы уже в срезе 1) | не начат |
| 5 | Загрузка изображений (диск `/uploads`) | не начат |
| 6 | Баны, жалобы, панель `/mod`, уникальный голос | не начат |
| 7 | Rate-limit, капча/honeypot, XSS | не начат |
| 8 | `/api/ai/moderate` без блокировки постинга | не начат |
| 9 | Обновить implementation/ + SRS-артефакты | не начат |
