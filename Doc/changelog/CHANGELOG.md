# Changelog

Формат: [Keep a Changelog](https://keepachangelog.com/). Версии пока календарные, semver можно включить с первым тегом.

## Unreleased

- Регистрация и вход через UI (User + JWT)
- Публичная лента `/study/` с демо-постами из сида
- Каталог `Doc/` для контекста, реализации, спек и журнала разработки

## 2026-09-07 — scaffold

### Added

- Backend Express + Prisma: доски, посты, комментарии, голоса, удаление поста
- Frontend Vue 3: лента доски `study`, карточка поста, голосование
- Docker Compose: PostgreSQL 16, backend :4000, frontend :5173
- Модель `Moderator` в схеме без использования в API
