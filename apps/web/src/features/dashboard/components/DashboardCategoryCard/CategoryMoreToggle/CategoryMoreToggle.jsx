"use client";

import styles from "./CategoryMoreToggle.module.scss";

export default function CategoryMoreToggle({ expanded, onToggle }) {
  return (
    <button type="button" className={styles.toggle} onClick={onToggle}>
      <span className={styles.label}>{expanded ? "less" : "more"}</span>
      <span className={styles.dots}>•••</span>
    </button>
  );
}
