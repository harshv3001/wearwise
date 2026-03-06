// apps/web/src/components/header/HeaderUser.jsx
import styles from "./Header.module.scss";

export default function HeaderUser() {
  return (
    <button type="button" className={styles.userBtn}>
      <span className="material-symbols-outlined" aria-hidden="true">
        account_circle
      </span>
      <span className={styles.userText}>User</span>
    </button>
  );
}
