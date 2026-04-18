"use client";

import styles from "./SaveToggle.module.scss";

export default function SaveToggle({
  selected = false,
  disabled = false,
  onClick,
  label = "Save",
  className = "",
}) {
  const buttonClassName = [
    styles.toggle,
    selected ? styles.selected : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const indicatorClassName = [
    styles.indicator,
    selected ? styles.indicatorSelected : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center justify-between gap-3 text-left ${buttonClassName}`}
    >
      <span className={styles.label}>{label}</span>
      <span
        className={`flex items-center justify-center ${indicatorClassName}`}
        aria-hidden="true"
      >
        ✓
      </span>
    </button>
  );
}
