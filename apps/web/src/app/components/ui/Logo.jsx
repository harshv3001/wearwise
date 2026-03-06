import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
    >
      <span className="material-symbols-outlined">dresser</span>
      <span className="sr-only">WearWise</span>
    </Link>
  );
}
