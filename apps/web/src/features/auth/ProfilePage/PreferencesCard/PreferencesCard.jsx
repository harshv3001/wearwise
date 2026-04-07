"use client";

import PreferenceFields from "../../component/PreferenceFields";
import FieldDisplay from "../FieldDisplay/FieldDisplay";
import SectionHeader from "../SectionHeader/SectionHeader";
import styles from "./PreferencesCard.module.scss";

export default function PreferencesCard({
  user,
  isEditing,
  formData,
  handleToggleMultiValue,
}) {
  return (
    <section className={styles.card}>
      <SectionHeader
        title="Preferences"
        description="Style and color choices make recommendations feel more personal."
      />

      {isEditing ? (
        <div className={styles.preferenceStack}>
          <PreferenceFields
            pref_styles={formData.pref_styles}
            pref_colors={formData.pref_colors}
            onToggle={handleToggleMultiValue}
          />
        </div>
      ) : (
        <div className={styles.preferenceStack}>
          <FieldDisplay
            label="Preferred Colors"
            value={user?.pref_colors?.length ? user.pref_colors.join(", ") : ""}
            placeholder="Not chosen"
          />
          <FieldDisplay
            label="Main Style Preference"
            value={user?.pref_styles?.length ? user.pref_styles.join(", ") : ""}
            placeholder="Not chosen"
          />
        </div>
      )}
    </section>
  );
}
