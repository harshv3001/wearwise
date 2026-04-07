import { http } from "../../../lib/http";

export const currentUserQueryKey = ["me"];
export const authIdentitiesQueryKey = ["auth-identities"];
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

// FastAPI OAuth2PasswordRequestForm -> x-www-form-urlencoded with "username"
export async function loginApi({ email, password }) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const res = await http.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return res.data; // { access_token, token_type }
}

export async function getCurrentUserApi() {
  const res = await http.get("/auth/me");
  return res.data;
}

export async function getAuthIdentitiesApi() {
  const res = await http.get("/auth/identities");
  return res.data;
}

export async function updateCurrentUserApi(payload) {
  const res = await http.patch("/auth/me", payload);
  return res.data;
}

export async function uploadProfileImageApi(formData) {
  const res = await http.post("/auth/me/image", formData);
  return res.data;
}

export async function changePasswordApi(payload) {
  await http.post("/auth/change-password", payload);
}

// Register -> JSON payload (matches your schema)
export async function registerApi(payload) {
  const res = await http.post("/auth/register", payload);
  return res.data;
}

export async function startOAuthApi(provider, intent = "login") {
  const res = await http.get(`/auth/oauth/${provider}/start`, {
    params: { intent },
  });
  return res.data;
}

export async function exchangeOAuthCodeApi(code) {
  const res = await http.post("/auth/oauth/exchange", { code });
  return res.data;
}

export function getOAuthProviderStartUrl(provider, intent = "login") {
  return `${apiBaseUrl}/auth/oauth/${provider}/start?intent=${intent}`;
}
