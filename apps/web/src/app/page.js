import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "./components/ui/actions";
import { isTokenExpired, TOKEN_COOKIE_KEY } from "../lib/auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_KEY)?.value;

  if (token && !isTokenExpired(token)) {
    redirect("/dashboard");
  }

  return (
    <main
      className="flex flex-col w-full items-center justify-center p-6 gap-6"
      style={{ padding: 24 }}
    >
      <h1 className="text-5xl font-bold">WearWise</h1>

      <div
        className="gap-6 mb-12"
        style={{ display: "flex", gap: 12, marginTop: 16 }}
      >
        <Link href="/login" passHref>
          <Button variant="secondary">Login</Button>
        </Link>
        <Link href="/register" passHref>
          <Button variant="secondary">Register</Button>
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
