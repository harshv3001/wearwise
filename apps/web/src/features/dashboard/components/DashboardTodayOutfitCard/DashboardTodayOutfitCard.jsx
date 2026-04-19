"use client";

import { Button } from "@/app/components/ui/actions";
import { Card, ImageWithFallback } from "@/app/components/ui/display";
import { Skeleton } from "@/app/components/ui/feedback";
import { formatDate, formatCapitalizedValue } from "@/lib/helperFunctions";
import styles from "./DashboardTodayOutfitCard.module.scss";

function TodayOutfitSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      <Skeleton className={styles.imageFrame} height={180} width="100%" />
      <Skeleton variant="text" width="74%" height={32} />
      <Skeleton variant="text" width="46%" height={22} />
      <Skeleton variant="rounded" width={118} height={32} />
      <Skeleton variant="text" width="68%" height={20} />
    </div>
  );
}

export default function DashboardTodayOutfitCard({
  todayOutfit,
  isLoading = false,
  isError = false,
  onReportOutfit,
}) {
  return (
    <Card
      title="Today's Logged Outfit"
      className={styles.card}
      contentClassName={styles.content}
      fullHeight
    >
      {isLoading ? (
        <TodayOutfitSkeleton />
      ) : isError ? (
        <p className={styles.message}>
          Today&apos;s outfit could not be loaded right now.
        </p>
      ) : !todayOutfit ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <span className="material-symbols-outlined">checkroom</span>
          </div>
          <div className={styles.emptyTitle}>Nothing logged for today yet</div>
          <p className={styles.message}>
            Once you report an outfit, its image, name, and occasion will show
            up here.
          </p>
          <Button variant="tertiary" size="sm" onClick={onReportOutfit}>
            Report Today&apos;s Outfit
          </Button>
        </div>
      ) : (
        <div className={styles.outfitCard}>
          <ImageWithFallback
            imageUrl={todayOutfit.image_url}
            alt={todayOutfit.name}
            fallbackText={todayOutfit.name}
            className={styles.imageFrame}
            imgClassName={styles.image}
          />

          <div className={styles.name}>{todayOutfit.name}</div>
          <div className={styles.meta}>
            {formatCapitalizedValue(todayOutfit.occasion, "No occasion")}
          </div>

          <div className={styles.badge}>{formatDate(todayOutfit.date_worn)}</div>

          <div className={styles.caption}>
            Logged at{" "}
            {new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(todayOutfit.created_at))}
          </div>
        </div>
      )}
    </Card>
  );
}
