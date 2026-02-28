"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import RegisterForm from "../../../features/auth/component/RegisterForm";
import { registerApi, loginApi } from "../../../features/auth/api/authApi";
import { setToken } from "../../../lib/auth";
import { getApiErrorMessage } from "../../../lib/apiError";

export default function RegisterPage() {
  const router = useRouter();

  const registerMut = useMutation({
    mutationFn: registerApi,
  });

  const loginMut = useMutation({
    mutationFn: loginApi,
  });

  const handleRegister = async (payload) => {
    console.log("Registering with", payload);
    try {
      // 1) register
      await registerMut.mutateAsync(payload);

      // 2) auto-login
      const data = await loginMut.mutateAsync({
        email: payload.email,
        password: payload.password,
      });

      const token = data?.access_token || data?.token;
      if (!token) {
        alert("Registered, but token missing. Please login manually.");
        router.replace("/login");
        return;
      }

      setToken(token);
      router.replace("/dashboard");
    } catch (err) {
      alert(getApiErrorMessage(err, "Registration failed"));
    }
  };

  const loading = registerMut.isPending || loginMut.isPending;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl p-6 ring-1 ring-inset ring-zinc-300">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm opacity-70">
          Set up your profile and preferences.
        </p>

        <div className="mt-6">
          <RegisterForm onSubmit={handleRegister} loading={loading} />
        </div>

        <p className="mt-5 text-sm opacity-70">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}