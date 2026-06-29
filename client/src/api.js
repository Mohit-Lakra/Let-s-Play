import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lets-play-node-server.onrender.com/api',
});

// Automatically add JWT to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
