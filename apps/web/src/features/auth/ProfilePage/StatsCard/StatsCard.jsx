import SectionHeader from "../SectionHeader/SectionHeader";
import styles from "./StatsCard.module.scss";

export default function StatsCard({ dashboardSummaryQuery }) {
  const summaryStats = dashboardSummaryQuery?.data?.stats;

  return (
    <section className={styles.card}>
      <SectionHeader title="Stats" />
      {dashboardSummaryQuery.isLoading ? (
        <div>loading..</div>
      ) : (
        <div className={styles.statsGrid}>
          <div>
            <p className={styles.statLabel}>Closet Items</p>
            <p className={styles.statValue}>
              {summaryStats?.total_closet_items ?? 0}
            </p>
          </div>
          <div>
            <p className={styles.statLabel}>Outfits Logged</p>
            <p className={styles.statValue}>
              {summaryStats?.saved_outfits_count ?? 0}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
