"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../lib/auth";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const token = getToken();
  const { isLoading, isFetched } = useCurrentUser();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  if (!token) return null;
  if (isLoading && !isFetched) return null;

  return children;
}
