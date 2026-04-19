"use client";

import Backdrop from "../Backdrop";
import styles from "./Modal.module.scss";

export default function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
}) {
  if (!open) return null;

  return (
    <>
      <Backdrop open={open} onClick={onClose} />

      <div
        className={`${styles.modal} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between ${styles.header}`}>
          {title ? <h2 className={styles.title}>{title}</h2> : <div />}
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
          >
            <span className={`material-symbols-outlined ${styles.closeIcon}`}>
              close
            </span>
          </button>
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </>
  );
}
