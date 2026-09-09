<script setup>
import { ref } from 'vue';
import { register, login, setToken } from '../api/client';

const emit = defineEmits(['authed']);

const mode = ref('login');
const loginName = ref('');
const password = ref('');
const error = ref('');
const pending = ref(false);

async function submit() {
  error.value = '';
  pending.value = true;
  try {
    const data =
      mode.value === 'register'
        ? await register(loginName.value, password.value)
        : await login(loginName.value, password.value);
    setToken(data.token);
    emit('authed', data.user);
    password.value = '';
  } catch (err) {
    error.value = err.response?.data?.error || 'Не удалось войти';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form class="auth-panel" @submit.prevent="submit">
    <div class="auth-toggle">
      <button type="button" :class="{ active: mode === 'login' }" @click="mode = 'login'">
        Вход
      </button>
      <button type="button" :class="{ active: mode === 'register' }" @click="mode = 'register'">
        Регистрация
      </button>
    </div>
    <input v-model="loginName" type="text" name="login" placeholder="Логин" autocomplete="username" required />
    <input
      v-model="password"
      type="password"
      name="password"
      placeholder="Пароль"
      :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
      required
    />
    <button type="submit" :disabled="pending">
      {{ mode === 'register' ? 'Создать аккаунт' : 'Войти' }}
    </button>
    <p v-if="error" class="auth-error">{{ error }}</p>
  </form>
</template>

<style scoped>
.auth-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.auth-toggle {
  display: flex;
  gap: 8px;
}
.auth-toggle button {
  flex: 1;
  border: 1px solid #ddd;
  background: #f7f7f7;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
}
.auth-toggle button.active {
  background: #eee;
  font-weight: 600;
}
.auth-panel input,
.auth-panel > button[type='submit'] {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font: inherit;
}
.auth-panel > button[type='submit'] {
  cursor: pointer;
  background: #eee;
}
.auth-panel > button[type='submit']:disabled {
  opacity: 0.6;
  cursor: default;
}
.auth-error {
  margin: 0;
  color: #a33;
  font-size: 0.9em;
}
</style>
