import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

export const getBoards = () => api.get('/boards').then((r) => r.data);
export const getPosts = (slug) => api.get(`/boards/${slug}/posts`).then((r) => r.data);
export const createPost = (slug, data) =>
  api.post(`/boards/${slug}/posts`, data).then((r) => r.data);
export const votePost = (id, value) =>
  api.post(`/posts/${id}/vote`, { value }).then((r) => r.data);
export const addComment = (id, data) =>
  api.post(`/posts/${id}/comments`, data).then((r) => r.data);

export default api;
