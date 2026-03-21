"use client";

import { useState } from "react";
import Input from "../../../app/components/ui/Input/Input";
import Button from "../../../app/components/ui/Button";
import EyeToggleButton from "@/app/components/ui/EyeToggleButton/EyeToggleButton";

export default function LoginForm({ onSubmit, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validate = () => {
    const nextErrors = { email: "", password: "" };

    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Email is invalid";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 5) {
      nextErrors.password = "Password must be at least 5 characters";
    }

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ email, password });
  };

  return (
    <div className="w-full">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoComplete="email"
          error={errors.email}
        />

        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            error={errors.password}
          />

          <EyeToggleButton isVisible={showPassword} onClick={setShowPassword} />
        </div>

        <Button
          className="w-full"
          variant="primary"
          disabled={loading}
          type="submit"
        >
          <span className="flex items-center gap-2">
            <span> {loading ? "Signing in..." : "Sign in"}</span>
            <span
              className="material-symbols-outlined  leading-none"
              style={{ fontSize: "18px" }}
            >
              arrow_forward
            </span>
          </span>
        </Button>
      </form>
    </div>
  );
}
