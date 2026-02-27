"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { http } from "../../../lib/http";
import { setToken } from "../../../lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // FastAPI OAuth2PasswordRequestForm expects x-www-form-urlencoded with "username"
      const body = new URLSearchParams();
      body.set("username", email);
      body.set("password", password);

      const res = await http.post("/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = res?.data?.access_token;
      if (!token) {
        setError("No access_token received from server");
        setLoading(false);
        return;
      }

      setToken(token);
      router.replace("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10 }}
        />

        <button disabled={loading} type="submit" style={{ padding: 10 }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      </form>
      <p style={{ marginTop: 16 }}>
        Don't have an account?{" "}
        <Link href="/register" style={{ color: "blue", textDecoration: "underline" }}>
          Register here
        </Link>
      </p>
    </main>
  );
}