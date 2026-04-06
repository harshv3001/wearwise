import { clearToken } from "./auth";
import { queryClient } from "./queryClient";
import axios from "axios";

let isLoggingOut = false;

export function logoutUser(redirectTo = "/login") {
  clearToken();
  queryClient.clear();

  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (baseURL) {
    axios.post(`${baseURL}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
  }

  if (typeof window === "undefined" || isLoggingOut) return;

  isLoggingOut = true;

  if (window.location.pathname !== redirectTo) {
    window.location.replace(redirectTo);
    return;
  }

  isLoggingOut = false;
}
