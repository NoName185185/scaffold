import axios from 'axios';

const TOKEN_KEY = 'token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getBoards = () => api.get('/boards').then((r) => r.data);
export const getPosts = (slug) => api.get(`/boards/${slug}/posts`).then((r) => r.data);
export const createPost = (slug, data) =>
  api.post(`/boards/${slug}/posts`, data).then((r) => r.data);
export const votePost = (id, value) =>
  api.post(`/posts/${id}/vote`, { value }).then((r) => r.data);
export const addComment = (id, data) =>
  api.post(`/posts/${id}/comments`, data).then((r) => r.data);

export const register = (login, password) =>
  api.post('/auth/register', { login, password }).then((r) => r.data);
export const login = (loginName, password) =>
  api.post('/auth/login', { login: loginName, password }).then((r) => r.data);
export const me = () => api.get('/auth/me').then((r) => r.data);

export default api;
