"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export default function Home() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet("/health"),
  });

  console.log("Health check data:", data);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">WearWise</h1>

      <div className="mt-6 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Backend Health</h2>
          <button
            onClick={() => refetch()}
            className="rounded-md border px-3 py-1 text-sm"
          >
            Refresh
          </button>
        </div>

        {isLoading && <p className="mt-3">Checking...</p>}

        {isError && (
          <p className="mt-3 text-red-600">
            Failed: {error.message}
          </p>
        )}

        {data && (
          <pre className="mt-3 rounded bg-gray-100 p-3 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}