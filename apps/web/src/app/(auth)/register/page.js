"use client";

import { useRouter } from "next/navigation";
import AuthLayout from "../AuthLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import RegisterForm from "../../../features/auth/component/RegisterForm";
import {
  currentUserQueryKey,
  registerApi,
  loginApi,
  startOAuthApi,
} from "../../../features/auth/api/authApi";
import { setToken } from "../../../lib/auth";
import { getApiErrorMessage } from "../../../lib/apiError";
import Button from "@/app/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
      if (data?.user) {
        queryClient.setQueryData(currentUserQueryKey, data.user);
      }
      router.replace("/dashboard");
    } catch (err) {
      alert(getApiErrorMessage(err, "Registration failed"));
    }
  };

  const handleSocialSignup = async (provider) => {
    try {
      const data = await startOAuthApi(provider, "login");
      if (!data?.authorization_url) {
        alert("Unable to start social signup right now.");
        return;
      }
      window.location.assign(data.authorization_url);
    } catch (err) {
      alert(getApiErrorMessage(err, `Could not start ${provider} signup`));
    }
  };

  const loading = registerMut.isPending || loginMut.isPending;

  return (
    <AuthLayout>
      <div className="mx-auto w-full">
        <RegisterForm onSubmit={handleRegister} loading={loading} />
        <div className="opacity-70 mt-8 text-center">
          ------------------- Or continue with --------------------
        </div>
        <div className="mt-5 flex gap-x-16 justify-center">
          <Button
            variant="secondary"
            type="button"
            onClick={() => handleSocialSignup("facebook")}
          >
            Facebook
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => handleSocialSignup("google")}
          >
            Google
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
