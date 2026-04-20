"use client";

import { Card } from "@/app/components/ui/display";
import UsageColumn from "./UsageColumn/UsageColumn";
import UsageSkeletonColumn from "./UsageSkeletonColumn";
import styles from "./DashboardUsageCard.module.scss";

export default function DashboardUsageCard({
  mostUsedItems = [],
  leastUsedItems = [],
  isLoading = false,
  isError = false,
}) {
  return (
    <Card
      className={styles.card}
      contentClassName={styles.content}
      fullHeight
      compact
    >
      {isLoading ? (
        <div className={styles.columns}>
          <UsageSkeletonColumn title="Most Used" />
          <UsageSkeletonColumn title="Least Used" />
        </div>
      ) : isError ? (
        <p className={styles.message}>
          Usage insights are unavailable right now.
        </p>
      ) : (
        <div className={styles.columns}>
          <UsageColumn
            title="Most Used"
            items={mostUsedItems}
            accentClassName={styles.mostUsedAccent}
            emptyText="Wear a few closet items to unlock your most-used highlights."
          />
          <UsageColumn
            title="Least Used"
            items={leastUsedItems}
            accentClassName={styles.leastUsedAccent}
            emptyText="Once you start rotating items, your least-used picks will show here."
          />
        </div>
      )}
    </Card>
  );
}
