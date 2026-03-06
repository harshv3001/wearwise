"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clearToken } from "../../../lib/auth";
import { getApiErrorMessage } from "../../../lib/apiError";
import { getClosetItemsApi } from "../../../features/closet/api/closetApi";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["closet-items"],
    queryFn: getClosetItemsApi,
  });

  const handleLogout = () => {
    clearToken(); // remove token from session storage
    queryClient.clear(); // clear cached private data
    router.replace("/login"); // go to login
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-inset ring-zinc-300"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? <p>Loading...</p> : null}
        {error ? <p>{getApiErrorMessage(error, "Failed to load")}</p> : null}

        {!isLoading && !error ? (
          <ul className="mt-3 space-y-2">
            {(data || []).map((item) => (
              <li key={item.id} className="rounded-lg ring-1 ring-zinc-300 p-3">
                {item.name || item.title || JSON.stringify(item)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
