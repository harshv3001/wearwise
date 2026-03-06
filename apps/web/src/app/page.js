import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>WearWise</h1>
      <p>Public Home Page</p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/closet">Closet</Link>
      </div>
    </main>
  );
}