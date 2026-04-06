"use client";

import { logoutUser } from "../../../lib/session";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";
import { useQuery } from "@tanstack/react-query";
import {
  authIdentitiesQueryKey,
  getAuthIdentitiesApi,
  startOAuthApi,
} from "../../../features/auth/api/authApi";

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: identities } = useQuery({
    queryKey: authIdentitiesQueryKey,
    queryFn: getAuthIdentitiesApi,
  });
  const fullName = [user?.first_name, user?.last_name]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  const handleLogout = () => {
    logoutUser();
  };

  const handleLinkProvider = async (provider) => {
    try {
      const data = await startOAuthApi(provider, "link");
      if (!data?.authorization_url) {
        alert("Unable to start account linking.");
        return;
      }
      window.location.assign(data.authorization_url);
    } catch (err) {
      alert(err?.response?.data?.detail || `Could not link ${provider}`);
    }
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
      <div style={{ marginTop: 24 }}>
        <h2>Sign-in methods</h2>
        <p>Password: {identities?.has_password ? "Enabled" : "Not set"}</p>
        <p>
          Linked providers:{" "}
          {identities?.providers?.length
            ? identities.providers.map((item) => item.provider).join(", ")
            : "None"}
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button type="button" onClick={() => handleLinkProvider("google")}>
            Link Google
          </button>
          <button type="button" onClick={() => handleLinkProvider("facebook")}>
            Link Facebook
          </button>
        </div>
      </div>
      <p>This page is protected, only authenticated users can see it.</p>
    </main>
  );
}
