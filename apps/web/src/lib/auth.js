export const TOKEN_KEY = "access_token";

export function getToken() {
  if (typeof window === "undefined") return null; // safety for server
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
}