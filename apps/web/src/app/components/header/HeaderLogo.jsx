import Link from "next/link";
import styles from "./Header.module.scss";

export default function HeaderLogo() {
  return (
    <Link href="/dashboard" className={styles.logo} aria-label="WearWise Home">
      <span className={styles.logoMark} aria-hidden="true">
        <span className={`material-symbols-outlined ${styles.icon}`}>
          dresser
        </span>
      </span>
      <span className={styles.brandName}>WearWise</span>
    </Link>
  );
}
