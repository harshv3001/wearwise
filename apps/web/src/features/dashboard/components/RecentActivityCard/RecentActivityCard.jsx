"use client";

import { Card } from "@/app/components/ui/display";
import { Skeleton } from "@/app/components/ui/feedback";
import { formatDate } from "@/lib/helperFunctions";
import styles from "./RecentActivityCard.module.scss";

function ActivityMetric({ label, value }) {
  return (
    <div className={styles.metricRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function RecentActivityCard({
  recentActivity,
  stats,
  isLoading = false,
  isError = false,
}) {
  return (
    <Card
      title="Recent Activity"
      className={styles.card}
      contentClassName={styles.content}
      fullHeight
      compact
    >
      {isLoading ? (
        <>
          <div className={styles.metricList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={`recent-activity-skeleton-${index}`}
                variant="rounded"
                width="100%"
                height={52}
              />
            ))}
          </div>
          <Skeleton variant="text" width="70%" height={20} />
        </>
      ) : isError ? (
        <p className={styles.message}>
          Activity insights are unavailable right now.
        </p>
      ) : (
        <>
          <div className={styles.metricList}>
            <ActivityMetric
              label="Logged this week"
              value={recentActivity?.logged_this_week_count ?? 0}
            />
            <ActivityMetric
              label="Saved outfits"
              value={stats?.saved_outfits_count ?? 0}
            />
            <ActivityMetric
              label="Last logged"
              value={
                recentActivity?.last_logged_date
                  ? formatDate(recentActivity.last_logged_date)
                  : "Not yet"
              }
            />
          </div>

          <p className={styles.message}>
            Keep reporting outfits to build stronger suggestions and usage
            insights over time.
          </p>
        </>
      )}
    </Card>
  );
}
