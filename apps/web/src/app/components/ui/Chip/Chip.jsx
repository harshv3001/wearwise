"use client";

import styles from "./Chip.module.scss";

export default function Chip({
  label,
  selected = false,
  disabled = false,
  onClick,
  className = "",
  selectedBg,
  selectedText,
  selectedBorder,
}) {
  const chipClassName = [
    styles.chip,
    selected ? styles.selected : "",
    disabled ? styles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={chipClassName}
      style={{
        ...(selectedBg ? { "--chip-selected-bg": selectedBg } : {}),
        ...(selectedText ? { "--chip-selected-text": selectedText } : {}),
        ...(selectedBorder ? { "--chip-selected-border": selectedBorder } : {}),
      }}
    >
      {label}
    </button>
  );
}
