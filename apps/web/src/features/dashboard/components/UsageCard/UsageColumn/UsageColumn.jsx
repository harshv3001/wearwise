"use client";

import UsageItem from "../UsageItem/UsageItem";
import styles from "./UsageColumn.module.scss";

export default function UsageColumn({
  title,
  items = [],
  accentClassName,
  emptyText,
}) {
  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>{title}</h4>

      {items.length > 0 ? (
        <div className={styles.itemList}>
          {items.map((item) => (
            <UsageItem
              key={`${title}-${item.id}`}
              item={item}
              accentClassName={accentClassName}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyCard}>{emptyText}</div>
      )}
    </div>
  );
}
