import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="flex flex-col w-full items-center justify-center p-6 gap-6"
      style={{ padding: 24 }}
    >
      <h1 className="text-5xl font-bold">WearWise</h1>
      <p>Public Home Page</p>

      <div
        className="gap-6 mb-12"
        style={{ display: "flex", gap: 12, marginTop: 16 }}
      >
        <Link href="/login" className="hover:underline">
          Login
        </Link>
        <Link href="/register" className=" hover:underline">
          Register
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
