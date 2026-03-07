"use client";

import Modal from "../../../app/components/ui/Modal/Modal";
import styles from "./ReportOutfitModal.module.scss";

export default function ReportOutfitModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Report Outfit">
      <div className="flex flex-col gap-4">
        <div>
          <label className={styles.label}>Today?</label>
          <div className="flex items-center gap-3">
            <button type="button" className={styles.toggleButton}>
              Yes
            </button>
            <button type="button" className={styles.toggleButton}>
              No
            </button>
          </div>
        </div>

        <div>
          <label className={styles.label}>Date</label>
          <input type="date" className={styles.input} />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="button" className={styles.primaryButton}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
