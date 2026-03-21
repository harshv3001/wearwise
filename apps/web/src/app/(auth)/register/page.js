"use client";

import { useRouter } from "next/navigation";
import AuthLayout from "../AuthLayout";
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
    try {
      await registerMut.mutateAsync(payload);

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
    <AuthLayout>
      <div className="mx-auto w-full">
        <RegisterForm onSubmit={handleRegister} loading={loading} />
      </div>
    </AuthLayout>
  );
}
