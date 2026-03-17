"use client";

import styles from "./AuthCard.module.scss";

export default function AuthCard({ children, className = "" }) {
  const bodyClassName = [styles.content];
  const cardClassName = ["flex flex-col", styles.card, className].join(" ");
  return (
    <div className="md:w-1/2 w-full">
      <section className={cardClassName}>
        <div className={bodyClassName}>{children}</div>
      </section>
    </div>
  );
}
