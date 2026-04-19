"use client";

import { Card, ImageWithFallback } from "@/app/components/ui/display";
import { Skeleton } from "@/app/components/ui/feedback";
import { formatCapitalizedValue } from "@/lib/helperFunctions";
import styles from "./DashboardUsageCard.module.scss";

function UsageItem({ title, item, accentClassName, emptyText }) {
  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>{title}</h4>

      {item ? (
        <div className={styles.usageCard}>
          <ImageWithFallback
            imageUrl={item.image_url}
            alt={item.name}
            fallbackText={item.name}
            className={styles.imageFrame}
            imgClassName={styles.image}
          />

          <div className={styles.itemName}>{item.name}</div>
          <div className={styles.itemCategory}>
            {formatCapitalizedValue(item.category)}
          </div>
          <div className={`${styles.wornCount} ${accentClassName}`}>
            Worn {item.times_worn}x
          </div>
        </div>
      ) : (
        <div className={styles.emptyCard}>{emptyText}</div>
      )}
    </div>
  );
}

function UsageSkeletonColumn({ title }) {
  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>{title}</h4>
      <div className={styles.usageCard}>
        <Skeleton className={styles.imageFrame} height={124} width="100%" />
        <Skeleton variant="text" width="80%" height={28} />
        <Skeleton variant="text" width="54%" height={20} />
        <Skeleton variant="text" width="44%" height={22} />
      </div>
    </div>
  );
}

export default function DashboardUsageCard({
  mostUsedItem,
  leastUsedItem,
  isLoading = false,
  isError = false,
}) {
  return (
    <Card
      className={styles.card}
      contentClassName={styles.content}
      fullHeight
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
          <UsageItem
            title="Most Used"
            item={mostUsedItem}
            accentClassName={styles.mostUsedAccent}
            emptyText="Wear a few closet items to unlock your most-used highlight."
          />
          <UsageItem
            title="Least Used"
            item={leastUsedItem}
            accentClassName={styles.leastUsedAccent}
            emptyText="Once you start rotating items, your least-used pick will show here."
          />
        </div>
      )}
    </Card>
  );
}
