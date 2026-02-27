"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { http } from "../../../lib/http";
import { clearToken } from "../../../lib/auth";

export default function DashboardPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch items
  const fetchClosetItems = async () => {
    try {
      const response = await http.get("/closet-items/");
      setItems(response.data);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to fetch closet items";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    clearToken();          // remove token from sessionStorage
    setItems([]);          // optional cleanup
    router.replace("/login"); // redirect to login
  };

  useEffect(() => {
    fetchClosetItems();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>

      <button
        onClick={handleLogout}
        style={{
          marginBottom: 20,
          padding: "8px 12px",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {loading && <p>Loading items...</p>}

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <>
          <h2>Your Closet Items</h2>

          {items.length === 0 ? (
            <p>No items found.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  {item.name || item.title || JSON.stringify(item)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}