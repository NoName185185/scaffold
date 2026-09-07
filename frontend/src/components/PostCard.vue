<script setup>
defineProps({ post: Object });
const emit = defineEmits(['vote']);
</script>

<template>
  <article class="post-card">
    <h3>{{ post.title }}</h3>
    <p>{{ post.body }}</p>
    <div class="votes">
      <button @click="emit('vote', post.id, 1)">▲</button>
      <span>{{ post.upvotes - post.downvotes }}</span>
      <button @click="emit('vote', post.id, -1)">▼</button>
      <span class="comments-count">{{ post.comments?.length || 0 }} комм.</span>
    </div>
  </article>
</template>

<style scoped>
.post-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
}
.votes {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.votes button {
  cursor: pointer;
  border: none;
  background: #eee;
  border-radius: 4px;
  padding: 2px 8px;
}
.comments-count {
  margin-left: auto;
  color: #888;
  font-size: 0.9em;
}
</style>
