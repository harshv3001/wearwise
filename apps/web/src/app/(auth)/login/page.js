"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../AuthLayout";
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
    <AuthLayout>
      <div className="w-full md:w-1/2 flex flex-col items-center p-16">
        <div className="mb-4 text-3xl font-semibold">Sign in</div>
        <div className="mb-4 text-sm opacity-70">
          Continue to your wardrobe dashboard.
        </div>

        <div className="w-full mt-6">loading={loginMut.isPending}</div>

        <div className="mt-8 text-sm opacity-70 flex items-center justify-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Register
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
