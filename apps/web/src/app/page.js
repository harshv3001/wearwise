"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "./components/ui/Button";
import { getToken } from "../lib/auth";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";

export default function HomePage() {
  const router = useRouter();
  const token = getToken();
  const { data: user, isLoading, isFetched } = useCurrentUser();

  useEffect(() => {
    if (token && user) {
      router.replace("/dashboard");
    }
  }, [router, token, user]);

  if (token && (!isFetched || isLoading)) {
    return (
      <main
        className="flex min-h-screen w-full items-center justify-center p-6"
        style={{ padding: 24 }}
      >
        <p>Checking your session...</p>
      </main>
    );
  }

  if (token && user) {
    return null;
  }

  return (
    <main
      className="flex flex-col w-full items-center justify-center p-6 gap-6"
      style={{ padding: 24 }}
    >
      <h1 className="text-5xl font-bold">WearWise</h1>

      <div
        className="gap-6 mb-12"
        style={{ display: "flex", gap: 12, marginTop: 16 }}
      >
        <Link href="/login" passHref>
          <Button variant="secondary">Login</Button>
        </Link>
        <Link href="/register" passHref>
          <Button variant="secondary">Register</Button>
        </Link>
      </div>

      <img
        src="closet.svg"
        alt="Closet illustration"
        className="w-64 items-center justify-center p-6 mb-12"
      />
    </main>
  );
}
