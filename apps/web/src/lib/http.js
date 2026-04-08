import axios from "axios";
import { getToken, setToken } from "./auth";
import { logoutUser } from "./session";

const baseURL = process.env.NEXT_PUBLIC_API_URL; // http://localhost:8000 OR http://api:8000

let refreshPromise = null;

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${baseURL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        const nextToken = res?.data?.access_token;
        if (!nextToken) {
          throw new Error("Refresh succeeded but no access token was returned.");
        }
        setToken(nextToken);
        return nextToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

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
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config || {};

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/oauth/")
    ) {
      originalRequest._retry = true;
      try {
        const nextToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        logoutUser();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401) logoutUser();
    return Promise.reject(error);
  }
);
