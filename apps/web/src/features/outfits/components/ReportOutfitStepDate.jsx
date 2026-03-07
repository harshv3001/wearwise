"use client";

import styles from "./ReportOutfitModal.module.scss";

export default function ReportOutfitStepDate({
  selectedDate,
  setSelectedDate,
}) {
  return (
    <div className="mx-auto flex max-w-[240px] flex-col gap-6">
      <div>
        <label className={styles.sectionLabel}>Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.input}
        />
      </div>
    </div>
  );
}
