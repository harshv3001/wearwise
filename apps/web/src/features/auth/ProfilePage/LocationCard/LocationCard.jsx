"use client";

import { useCallback } from "react";
import LocationFields from "../../component/LocationFields";
import { getUserLocationLabel } from "../profileHelpers";
import FieldDisplay from "../FieldDisplay/FieldDisplay";
import SectionHeader from "../SectionHeader/SectionHeader";
import styles from "./LocationCard.module.scss";

export default function LocationCard({
  user,
  isEditing,
  formData,
  onLocationUpdate,
}) {
  // Destructure UI-only fields that don't belong in the profile form payload
  const handleLocationUpdate = useCallback(
    (updates) => {
      // eslint-disable-next-line no-unused-vars
      const { state_required, selected_city, ...formUpdates } = updates;
      onLocationUpdate(formUpdates);
    },
    [onLocationUpdate]
  );

  const locationLabel = getUserLocationLabel(user);

  return (
    <section className={styles.card}>
      <SectionHeader
        title="Location"
        description="This helps tailor weather-aware outfit context."
      />

      {isEditing ? (
        <LocationFields
          values={formData}
          onUpdate={handleLocationUpdate}
          required={false}
        />
      ) : (
        <div className={styles.singleColumn}>
          <FieldDisplay
            label="Location"
            value={locationLabel}
            placeholder="Location not added"
          />
        </div>
      )}
    </section>
  );
}
