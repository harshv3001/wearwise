import { clearToken } from "./auth";
import { queryClient } from "./queryClient";

let isLoggingOut = false;

export function logoutUser(redirectTo = "/login") {
  clearToken();
  queryClient.clear();

  if (typeof window === "undefined" || isLoggingOut) return;

  isLoggingOut = true;

  if (window.location.pathname !== redirectTo) {
    window.location.replace(redirectTo);
    return;
  }

  isLoggingOut = false;
}
