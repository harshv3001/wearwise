"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../AuthLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoginForm from "../../../features/auth/component/LoginForm";
import {
  currentUserQueryKey,
  loginApi,
  startOAuthApi,
} from "../../../features/auth/api/authApi";
import { setToken } from "../../../lib/auth";
import { getApiErrorMessage } from "../../../lib/apiError";
import Button from "@/app/components/ui/Button/Button";
import { showErrorToast, showSuccessToast } from "../../../lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMut = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const token = data?.access_token || data?.token;
      if (!token) {
        showErrorToast("Login succeeded but no token was returned.");
        return;
      }
      setToken(token);
      if (data?.user) {
        queryClient.setQueryData(currentUserQueryKey, data.user);
      }
      showSuccessToast("Signed in successfully.");
      router.replace("/dashboard");
    },
    onError: (err) => showErrorToast(getApiErrorMessage(err, "Login failed")),
  });

  const handleSubmit = (values) => loginMut.mutate(values);
  const handleSocialLogin = async (provider) => {
    try {
      const data = await startOAuthApi(provider, "login");
      if (!data?.authorization_url) {
        showErrorToast("Unable to start social login right now.");
        return;
      }
      window.location.assign(data.authorization_url);
    } catch (err) {
      showErrorToast(
        getApiErrorMessage(err, `Could not start ${provider} login`)
      );
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[480px]">
        <div className="mb-6 space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-semibold">Welcome Back!</h1>
          <p className="text-sm">Sign in to your Smart Closet account</p>
        </div>

        <LoginForm loading={loginMut.isPending} onSubmit={handleSubmit} />

        <div className="mt-8 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline font-bold">
            Register
          </Link>
        </div>

        <div className="opacity-70 m-5 text-center">
          ------------------- Or continue with --------------------
        </div>
        <div className="flex gap-x-16 justify-center">
          <Button
            variant="secondary"
            type="button"
            onClick={() => handleSocialLogin("facebook")}
          >
            <span
              className="material-symbols-outlined leading-none"
              style={{ fontSize: "18px" }}
            ></span>
            <span>Facebook</span>
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => handleSocialLogin("google")}
          >
            Google
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
