"use client";

import styles from "./Header.module.scss";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";

export default function HeaderUser({ href }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);
  const label = user?.name?.trim() || "User";

  return (
    <Link
      href="/profile"
      className={`${styles.userBtn} ${isActive ? styles.active : ""}`}
    >
      <button type="button" className={styles.userBtn}>
        <span className="material-symbols-outlined" aria-hidden="true">
          account_circle
        </span>
        <span className={styles.userText}>{label}</span>
      </button>
    </Link>
  );
}
