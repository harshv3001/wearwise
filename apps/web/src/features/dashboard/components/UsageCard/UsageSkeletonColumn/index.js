"use client";

import { Skeleton } from "@/app/components/ui/feedback";
import styles from "./UsageSkeletonColumn.module.scss";

export default function UsageSkeletonColumn({ title }) {
  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>{title}</h4>

      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`usage-skeleton-${title}-${index}`}
          className={styles.usageCard}
        >
          <Skeleton className={styles.imageFrame} height={116} width="100%" />
          <Skeleton variant="text" width="80%" height={26} />
          <Skeleton variant="text" width="54%" height={20} />
          <Skeleton variant="text" width="44%" height={22} />
        </div>
      ))}
    </div>
  );
}
