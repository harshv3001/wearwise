import { http } from "../../../lib/http";

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

// Register -> JSON payload (matches your schema)
export async function registerApi(payload) {
  const res = await http.post("/auth/register", payload);
  return res.data;
}