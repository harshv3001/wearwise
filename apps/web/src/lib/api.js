import { getToken } from "./auth";
import { logoutUser } from "./session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  console.error("❌ NEXT_PUBLIC_API_URL is not defined");
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    logoutUser();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}
