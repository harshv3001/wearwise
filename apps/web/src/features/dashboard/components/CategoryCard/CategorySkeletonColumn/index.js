"use client";

import { Skeleton } from "@/app/components/ui/feedback";
import styles from "./CategorySkeletonColumn.module.scss";

export default function CategorySkeletonColumn() {
  return (
    <div className={styles.column}>
      <div className={styles.headerRow}>
        <Skeleton variant="text" width={58} height={18} />
        <Skeleton variant="text" width={26} height={18} />
      </div>

      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`category-skeleton-${index}`} className={styles.itemRow}>
          <Skeleton variant="text" width="70%" height={28} />
          <Skeleton variant="text" width={24} height={28} />
        </div>
      ))}
    </div>
  );
}
