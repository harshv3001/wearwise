"use client";

import styles from "./Backdrop.module.scss";

export default function Backdrop({ open, onClick }) {
  return (
    <div
      className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
      onClick={onClick}
    />
  );
}
