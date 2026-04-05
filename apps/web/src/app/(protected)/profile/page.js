"use client";

import { logoutUser } from "../../../lib/session";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const fullName = [user?.first_name, user?.last_name]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Profile</h1>
      {isLoading ? (
        <p>Loading your profile...</p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <p>
            <strong>Name:</strong> {fullName || user?.email || "-"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "-"}
          </p>
          <p>
            <strong>Location:</strong>{" "}
            {[user?.city, user?.state, user?.country].filter(Boolean).join(", ") ||
              "-"}
          </p>
        </div>
      )}
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
