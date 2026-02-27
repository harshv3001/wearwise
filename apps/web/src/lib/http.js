import axios from "axios";
import { getToken, clearToken } from "./auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL; // http://localhost:8000 OR http://api:8000

export const http = axios.create({
  baseURL,
});

// Add token automatically
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If token is invalid/expired, clear it
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) clearToken();
    return Promise.reject(error);
  }
);