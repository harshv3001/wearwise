"use client";

import { useEffect, useState } from "react";
import styles from "./Header.module.scss";
import HeaderLogo from "./HeaderLogo";
import HeaderNav from "./HeaderNav";
import HeaderUser from "./HeaderUser";
import MobileSidebar from "./MobileSidebar";

export default function Header() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className={styles.header}>
        <div className={`${styles.inner} mx-auto`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={styles.hamburger}
              onClick={toggle}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <span className={`material-symbols-outlined ${styles.icon}`}>
                menu
              </span>
            </button>

            <HeaderLogo />
          </div>

          <div className="flex items-center gap-4">
            <HeaderNav />
            <HeaderUser />
          </div>
        </div>
      </header>

      <MobileSidebar open={open} onClose={close} />
    </>
  );
}
