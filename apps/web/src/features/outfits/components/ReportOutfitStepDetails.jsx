"use client";

import styles from "./ReportOutfitModal.module.scss";

export default function ReportOutfitStepDetails({ formData, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-x-16 gap-y-8">
      <div>
        <label className={styles.fieldLabel}>First Name*</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          placeholder="Enter your first name"
          className={styles.input}
        />
      </div>

      <div>
        <label className={styles.fieldLabel}>Country</label>
        <select
          value={formData.country}
          onChange={(e) => onChange("country", e.target.value)}
          className={styles.input}
        >
          <option value="">Select your country</option>
          <option value="usa">USA</option>
          <option value="india">India</option>
          <option value="canada">Canada</option>
        </select>
      </div>

      <div>
        <label className={styles.fieldLabel}>Last Name*</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          placeholder="Enter your last name"
          className={styles.input}
        />
      </div>

      <div>
        <label className={styles.fieldLabel}>City</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="Enter your city"
          className={styles.input}
        />
      </div>
    </div>
  );
}
