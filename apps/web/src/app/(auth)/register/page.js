"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { http } from "../../../lib/http";
import { setToken } from "../../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const initialForm = {
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    pref_styles_text: "",
    pref_colors_text: "",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parseCommaList = (text) =>
    text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        age: Number(form.age || 0),
        gender: form.gender,
        country: form.country,
        state: form.state,
        city: form.city,
        pref_styles: parseCommaList(form.pref_styles_text),
        pref_colors: parseCommaList(form.pref_colors_text),
      };

      // 1) Register (JSON)
      console.log("Registering with payload:", payload);
      await http.post("/auth/register", payload);

      // 2) Auto-login (OAuth2PasswordRequestForm: username/password)
      const body = new URLSearchParams();
      body.set("username", form.email);
      body.set("password", form.password);

      const loginRes = await http.post("/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = loginRes?.data?.access_token;
      if (!token) {
        setError("Registered, but login token missing. Please login manually.");
        setLoading(false);
        return;
      }

      setToken(token);
      setForm(initialForm);
      router.replace("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 520 }}>
      <h1>Register</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, marginTop: 16 }}
      >
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <input
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <input
          name="gender"
          placeholder="Gender"
          value={form.gender}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <input
          name="state"
          placeholder="State"
          value={form.state}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <input
          name="pref_styles_text"
          placeholder='Preferred styles (comma separated) e.g. "casual, formal"'
          value={form.pref_styles_text}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <input
          name="pref_colors_text"
          placeholder='Preferred colors (comma separated) e.g. "black, blue, green"'
          value={form.pref_colors_text}
          onChange={onChange}
          style={{ padding: 10 }}
          required
        />

        <button disabled={loading} type="submit" style={{ padding: 10 }}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      </form>
    </main>
  );
}