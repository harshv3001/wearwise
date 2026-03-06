"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../../lib/apiError";
import { getClosetItemsApi } from "../../../features/closet/api/closetApi";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["closet-items"],
    queryFn: getClosetItemsApi,
  });

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
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
