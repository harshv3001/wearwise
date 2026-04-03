"use client";

import { logoutUser } from "../../../lib/session";

export default function ProfilePage() {
  const handleLogout = () => {
    logoutUser();
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
