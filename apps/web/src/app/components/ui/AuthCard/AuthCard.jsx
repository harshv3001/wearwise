"use client";

import styles from "./AuthCard.module.scss";

export default function AuthCard({ children, className = "" }) {
  const cardClassName = [styles.card, className].filter(Boolean).join(" ");

  return (
    <div className={styles.wrapper}>
      <section className={cardClassName}>
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  );
}
