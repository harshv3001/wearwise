"use client";

import styles from "./FloatingSidePanel.module.scss";

export default function FloatingSidePanel({
  open,
  onToggle,
  onClose,
  triggerLabel = "Open panel",
  children,
  className = "",
  panelClassName = "",
}) {
  return (
    <div
      className={`${styles.root} ${open ? styles.rootOpen : ""} ${className}`}
    >
      <div
        className={`${styles.panel} ${open ? styles.panelOpen : ""} ${panelClassName}`}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close panel"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className={styles.panelBody}>{children}</div>
      </div>

      <button
        type="button"
        className={styles.trigger}
        onClick={onToggle}
        aria-expanded={open}
        aria-label={triggerLabel}
      >
        <span className={styles.triggerText}>{triggerLabel}</span>
      </button>
    </div>
  );
}
