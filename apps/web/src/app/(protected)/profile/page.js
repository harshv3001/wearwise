"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { clearToken } from "../../../lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    clearToken(); // remove token from session storage
    queryClient.clear(); // clear cached private data
    router.replace("/login"); // go to login
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Profile</h1>
      <div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-inset ring-zinc-300"
        >
          Logout
        </button>
      </div>
      <p>This page is protected, only authenticated users can see it.</p>
    </main>
  );
}
