# Frontend

Корень: `frontend/`. Vue 3 + Vite. API-клиент: Axios, `frontend/src/api/client.js`.

Базовый URL: `VITE_API_URL` или `http://localhost:4000/api`.

## Экраны

Один экран: `App.vue`.

- Шапка: `AuthPanel` (вход/регистрация) или login + «Выйти»
- JWT в `localStorage`, interceptor Axios
- При монтировании грузит посты доски `study` (без логина)
- Если есть токен — `GET /auth/me`, при 401 токен сбрасывается
- Рендерит `PostCard` на каждый пост
- Пустой список: «Пока нет постов.»
- Голос: `votePost(id, value)` и замена объекта в массиве

Выбора доски, роутера, формы поста и комментариев в UI нет. В клиенте уже есть `getBoards`, `createPost`, `addComment` — не подключены к шаблону.

## Компоненты

`AuthPanel.vue` — вход и регистрация.
`PostCard.vue` — карточка поста (заголовок, тело, голоса).
