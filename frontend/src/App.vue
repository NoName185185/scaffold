<script setup>
import { ref, onMounted } from 'vue';
import { getPosts, votePost, me, getToken, clearToken } from './api/client';
import PostCard from './components/PostCard.vue';
import AuthPanel from './components/AuthPanel.vue';

const posts = ref([]);
const user = ref(null);
const boardSlug = 'study';

onMounted(async () => {
  try {
    posts.value = await getPosts(boardSlug);
  } catch {
    posts.value = [];
  }

  if (!getToken()) return;
  try {
    user.value = await me();
  } catch {
    clearToken();
    user.value = null;
  }
});

async function handleVote(postId, value) {
  const updated = await votePost(postId, value);
  const idx = posts.value.findIndex((p) => p.id === postId);
  if (idx !== -1) posts.value[idx] = updated;
}

function handleAuthed(nextUser) {
  user.value = nextUser;
}

function logout() {
  clearToken();
  user.value = null;
}
</script>

<template>
  <main class="container">
    <header class="topbar">
      <p v-if="user" class="session">
        {{ user.login }}
        <button type="button" @click="logout">Выйти</button>
      </p>
      <AuthPanel v-else @authed="handleAuthed" />
    </header>
    <h1>/{{ boardSlug }}/</h1>
    <PostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
      @vote="handleVote"
    />
    <p v-if="!posts.length">Пока нет постов.</p>
  </main>
</template>

<style>
.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: system-ui, sans-serif;
}
.session {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 20px;
}
.session button {
  cursor: pointer;
  border: 1px solid #ddd;
  background: #eee;
  border-radius: 4px;
  padding: 4px 10px;
  font: inherit;
}
</style>
