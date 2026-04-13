"use client";

import Button from "@/app/components/ui/Button.jsx";
import styles from "./OutfitActionsBar.module.scss";

export default function OutfitActionsBar({
  totalItems,
  isSaving,
  onSave,
  onClearCanvas,
  errorMessage,
}) {
  return (
    <div className={styles.wrapper}>
      {errorMessage ? <div className={styles.error}>{errorMessage}</div> : null}

      <div className={styles.count}>
        {totalItems} item{totalItems === 1 ? "" : "s"} selected
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          size="md"
          className={styles.button}
          disabled={totalItems === 0 || isSaving}
          onClick={onClearCanvas}
        >
          Refresh
        </Button>

        <Button
          type="button"
          variant="primary"
          size="md"
          className={styles.button}
          disabled={totalItems === 0 || isSaving}
          onClick={onSave}
        >
          {isSaving ? "Saving..." : "Save Outfit"}
        </Button>
      </div>
    </div>
  );
}
