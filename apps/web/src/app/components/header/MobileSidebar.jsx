"use client";

import styles from "./Header.module.scss";
import Drawer from "../ui/Drawer/Drawer.jsx";

export default function MobileSidebar({ open, onClose, children }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Menu"
      bodyClassName={styles.drawerBody}
    >
      {children}
    </Drawer>
  );
}
