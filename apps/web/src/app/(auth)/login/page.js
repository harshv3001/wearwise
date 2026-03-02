"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import LoginForm from "../../../features/auth/component/LoginForm";
import { loginApi } from "../../../features/auth/api/authApi";
import { setToken } from "../../../lib/auth";
import { getApiErrorMessage } from "../../../lib/apiError";

export default function LoginPage() {
  const router = useRouter();

  const loginMut = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const token = data?.access_token || data?.token;
      if (!token) return alert("Login succeeded but token missing.");
      setToken(token);
      router.replace("/dashboard");
    },
    onError: (err) => alert(getApiErrorMessage(err, "Login failed")),
  });

  const handleSubmit = (values) => loginMut.mutate(values);

  return (
    <main className="p-6">
      <div className="mb-2 text-xl font-semibold">Sign in</div>
      <div className="mb-6 text-sm opacity-70">
        Continue to your wardrobe dashboard.
      </div>

      <LoginForm loading={loginMut.isPending} onSubmit={handleSubmit} className="flex items-center justify-center"  />

      <div className="mt-5 text-sm opacity-70 flex items-center justify-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </div>
    </main>
  );
}