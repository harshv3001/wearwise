"use client";

import YesNoSwitch from "../../../app/components/ui/YesNoSwitch";
import styles from "./ReportOutfitModal.module.scss";
import { useEffect, useState } from "react";

function FormRow({ label, children }) {
  return (
    <div className={"w-[220px] flex items-center gap-4"}>
      <label className={styles.sectionLabel}>{label}</label>
      {children}
    </div>
  );
}

export default function ReportOutfitStepDate({
  selectedDate,
  setSelectedDate,
}) {
  const [today, setToday] = useState(true);

  useEffect(() => {
    if (today) {
      const todayDate = new Date().toISOString().split("T")[0];
      setSelectedDate(todayDate);
    }
  }, [today]);

  return (
    <div className="flex flex-col items-center gap-6">
      <FormRow label="Today?">
        <YesNoSwitch
          checked={today}
          onChange={(e) => setToday(e.target.checked)}
        />
      </FormRow>

      {!today && (
        <FormRow label="Date:">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.input}
          />
        </FormRow>
      )}
    </div>
  );
}
