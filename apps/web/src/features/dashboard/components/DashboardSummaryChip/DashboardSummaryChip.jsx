"use client";

import styles from "./DashboardSummaryChip.module.scss";

export default function DashboardSummaryChip({
  label,
  value,
  tone = "default",
}) {
  const toneClassName =
    tone === "accent"
      ? styles.accent
      : tone === "highlight"
        ? styles.highlight
        : styles.default;

  return (
    <div className={`${styles.chip} ${toneClassName}`}>
      <span className={styles.label}>{label}</span>
      <strong className={styles.value}>{value}</strong>
    </div>
  );
}
