"use client";

import styles from "./Header.module.scss";
import HeaderNav from "./HeaderNav";
import Backdrop from "../ui/Backdrop/Backdrop";

export default function MobileSidebar({ open, onClose, children }) {
  return (
    <>
      <Backdrop open={open} onClick={onClose} />

      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>Menu</div>
          <button
            type="button"
            className={styles.drawerClose}
            onClick={onClose}
          >
            <span className={`material-symbols-outlined ${styles.icon}`}>
              close
            </span>
          </button>
        </div>

        <div className={styles.drawerBody}>
          {/* <HeaderNav onNavigate={onClose} /> */}
          {children}
        </div>
      </aside>
    </>
  );
}
