"use client";

import { useState } from "react";
import Input from "../../../app/components/ui/Input/Input";
import Button from "../../../app/components/ui/Button";

export default function LoginForm({ onSubmit, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({ email: "", password: "" });

  const validate = () => {
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ email, password });
  };

  return (
    <>
      <div className="w-full grid items-center mx-auto">
        <form className="space-y-6 text-lg" onSubmit={handleSubmit}>
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
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute !bg-white right-2 top-[68%] -translate-y-[60%] p-1 rounded"
            >
              <img
                src={
                  showPassword
                    ? "eye-password-hide.svg"
                    : "eye-password-show.svg"
                }
                alt="hide/show password"
                className="w-5"
              />
            </button>
          </div>

          <Button
            className="w-full"
            variant="secondary"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </>
  );
}
