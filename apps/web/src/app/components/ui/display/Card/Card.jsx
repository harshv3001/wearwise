"use client";

import styles from "./Card.module.scss";

export default function Card({
  title,
  children,
  className = "",
  contentClassName = "",
  fullHeight = false,
  compact = false,
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
  const titleClassName = [styles.title, compact ? styles.titleCompact : ""]
    .filter(Boolean)
    .join(" ");
  const compactBodyClassName = [bodyClassName, compact ? styles.contentCompact : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={cardClassName}>
      {title ? <h3 className={titleClassName}>{title}</h3> : null}
      <div className={compactBodyClassName}>{children}</div>
    </section>
  );
}
