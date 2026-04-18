import Link from "next/link";
import styles from "./BrandLogo.module.scss";

export default function BrandLogo({ size = "md" }) {
  return (
    <Link
      href="/dashboard"
      className={[styles.logo, size === "large" ? styles.logoLarge : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label="WearWise Home"
    >
      <span className={styles.logoMark} aria-hidden="true">
        <span className={`material-symbols-outlined ${styles.icon}`}>
          dresser
        </span>
      </span>
      <span className={styles.brandName}>WearWise</span>
    </Link>
  );
}
