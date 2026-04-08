import { STATIC_AI_SETTINGS } from "../../../../lib/static-data";
import SectionHeader from "../SectionHeader/SectionHeader";
import styles from "./AISettingsCard.module.scss";

export default function AISettingsCard() {
  return (
    <section className={styles.card}>
      <SectionHeader
        title="AI Settings"
        description="Static preview for now while AI personalization is still in progress."
      />

      <div className={styles.aiList}>
        <div className={styles.aiRow}>
          <span>Weekday default</span>
          <span className={styles.aiPill}>{STATIC_AI_SETTINGS.weekdayDefault}</span>
        </div>
        <div className={styles.aiCheck}>
          <span>{STATIC_AI_SETTINGS.weatherSuggestions ? "✓" : "○"}</span>
          <span>Weather-based suggestions</span>
        </div>
        <div className={styles.aiCheck}>
          <span>{STATIC_AI_SETTINGS.prioritizeUnused ? "✓" : "○"}</span>
          <span>Prioritize unused items</span>
        </div>
      </div>
    </section>
  );
}
