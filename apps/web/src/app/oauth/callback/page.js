"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  exchangeOAuthCodeApi,
  currentUserQueryKey,
} from "../../../features/auth/api/authApi";
import { setToken } from "../../../lib/auth";
import { getApiErrorMessage } from "../../../lib/apiError";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get("code");
    const oauthError = searchParams.get("oauth_error");

    if (oauthError) {
      alert(`Social login failed: ${oauthError}`);
      router.replace("/login");
      return;
    }

    if (!code) {
      alert("Social login could not be completed.");
      router.replace("/login");
      return;
    }

    exchangeOAuthCodeApi(code)
      .then((data) => {
        const token = data?.access_token;
        if (!token) {
          throw new Error("OAuth completed but no access token was returned.");
        }

        setToken(token);
        if (data?.user) {
          queryClient.setQueryData(currentUserQueryKey, data.user);
        }

        router.replace("/dashboard");
      })
      .catch((err) => {
        alert(getApiErrorMessage(err, "Social login failed"));
        router.replace("/login");
      });
  }, [queryClient, router, searchParams]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Completing sign in</h1>
        <p className="mt-3 text-sm opacity-80">
          We&apos;re finishing your secure login and setting up your session.
        </p>
      </div>
    </main>
  );
}
