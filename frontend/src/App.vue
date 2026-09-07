<script setup>
import { ref, onMounted } from 'vue';
import { getPosts, votePost } from './api/client';
import PostCard from './components/PostCard.vue';

const posts = ref([]);
const boardSlug = 'study'; // временно захардкожено, позже сделать выбор доски

onMounted(async () => {
  posts.value = await getPosts(boardSlug);
});

async function handleVote(postId, value) {
  const updated = await votePost(postId, value);
  const idx = posts.value.findIndex((p) => p.id === postId);
  if (idx !== -1) posts.value[idx] = updated;
}
</script>

<template>
  <main class="container">
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
</style>
