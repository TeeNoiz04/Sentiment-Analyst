// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/client", // URL backend
  timeout: 5000,
});

// Interceptor thêm token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor xử lý lỗi chung
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err);
    return Promise.reject(err);
  }
);

export default api;
