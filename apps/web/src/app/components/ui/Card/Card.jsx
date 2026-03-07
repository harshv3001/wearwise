"use client";

import styles from "./Card.module.scss";

export default function Card({
  title,
  children,
  className = "",
  contentClassName = "",
  fullHeight = false,
}) {
  const cardClassName = [
    "flex flex-col",
    styles.card,
    fullHeight ? styles.fullHeight : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const bodyClassName = [styles.content, contentClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={cardClassName}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
