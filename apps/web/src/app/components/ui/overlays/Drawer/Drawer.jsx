"use client";

import Backdrop from "../Backdrop";
import styles from "./Drawer.module.scss";

export default function Drawer({
  open,
  onClose,
  title,
  children,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  titleClassName = "",
  closeButtonClassName = "",
  closeIconClassName = "",
}) {
  return (
    <>
      <Backdrop open={open} onClick={onClose} />

      <aside className={`${styles.drawer} ${open ? styles.open : ""} ${className}`}>
        <div className={`${styles.header} ${headerClassName}`}>
          <div className={`${styles.title} ${titleClassName}`}>{title}</div>
          <button
            type="button"
            className={`${styles.closeButton} ${closeButtonClassName}`}
            onClick={onClose}
            aria-label={`Close ${String(title).toLowerCase()}`}
          >
            <span
              className={`material-symbols-outlined ${styles.closeIcon} ${closeIconClassName}`}
              aria-hidden="true"
            >
              close
            </span>
          </button>
        </div>

        <div className={`${styles.body} ${bodyClassName}`}>{children}</div>
      </aside>
    </>
  );
}
