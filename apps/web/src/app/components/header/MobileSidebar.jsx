"use client";

import styles from "./Header.module.scss";
import HeaderNav from "./HeaderNav";

export default function MobileSidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-hidden={!open}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>Menu</div>
          <button
            type="button"
            className={styles.drawerClose}
            onClick={onClose}
            aria-label="Close menu"
          >
            <span className={`material-symbols-outlined ${styles.icon}`}>
              close
            </span>
          </button>
        </div>

        <div className={styles.drawerBody}>
          <HeaderNav onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
