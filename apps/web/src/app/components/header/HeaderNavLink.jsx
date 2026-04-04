"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.scss";

export default function HeaderNavLink({
  href,
  label,
  onNavigate,
  exact = false,
}) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${styles.navLink} ${isActive ? styles.active : ""}`}
    >
      {label}
    </Link>
  );
}
