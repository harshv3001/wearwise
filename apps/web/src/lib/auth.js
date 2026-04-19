export const TOKEN_KEY = "access_token";
export const TOKEN_COOKIE_KEY = "wearwise_access_token";

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;

  const [, payload = ""] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    if (typeof window === "undefined") {
      return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
    }

    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token) {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;

  if (typeof exp !== "number") return null;
  return exp * 1000;
}

export function isTokenExpired(token) {
  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) return false;

  return Date.now() >= expiryMs;
}

function writeTokenCookie(token) {
  if (typeof document === "undefined") return;

  const cookieParts = [
    `${TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Lax",
  ];
  const expiryMs = getTokenExpiryMs(token);

  if (expiryMs) {
    cookieParts.push(`Expires=${new Date(expiryMs).toUTCString()}`);
  }

  document.cookie = cookieParts.join("; ");
}

function clearTokenCookie() {
  if (typeof document === "undefined") return;

  document.cookie = `${TOKEN_COOKIE_KEY}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function getToken() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  if (isTokenExpired(token)) {
    clearToken();
    return null;
  }

  return token;
}

export function setToken(token) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
  writeTokenCookie(token);
}

export function clearToken() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  clearTokenCookie();
}
