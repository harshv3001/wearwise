import { STATIC_STATS } from "../../../../lib/static-data";
import SectionHeader from "../SectionHeader/SectionHeader";
import styles from "./StatsCard.module.scss";

export default function StatsCard() {
  return (
    <section className={styles.card}>
      <SectionHeader
        title="Stats"
        description="Static read-only preview until live metrics are wired in."
      />

      <div className={styles.statsGrid}>
        <div>
          <p className={styles.statLabel}>Closet Items</p>
          <p className={styles.statValue}>{STATIC_STATS.closetItems}</p>
        </div>
        <div>
          <p className={styles.statLabel}>Outfits Logged</p>
          <p className={styles.statValue}>{STATIC_STATS.outfitsLogged}</p>
        </div>
      </div>
    </section>
  );
}
