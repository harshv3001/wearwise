"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "../../../components/ui/Modal/Modal.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input/Input.jsx";
import SelectInput from "../../../components/ui/SelectInput/SelectInput.jsx";
import ImageWithFallback from "../../../components/ui/ImageWithFallback/ImageWithFallback.jsx";
import { SEASON_OPTIONS } from "../../../../lib/static-data.js";
import { formatCapitalizedValue } from "../../../../lib/helperFunctions.js";
import styles from "./SaveOutfitModal.module.scss";

const INITIAL_SAVE_FORM_DATA = {
  name: "",
  occasion: "",
  season: "",
  notes: "",
};

const OCCASION_OPTIONS = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "work", label: "Work" },
  { value: "party", label: "Party" },
  { value: "travel", label: "Travel" },
];

export default function SaveOutfitModal({
  open,
  onClose,
  canvasItems,
  canvasSnapshot,
  snapshotError,
  onSubmit,
  isSaving,
  initialValues = INITIAL_SAVE_FORM_DATA,
  title = "Save Outfit",
  submitLabel = "Save Outfit",
}) {
  const [saveFormData, setSaveFormData] = useState(initialValues);
  const [saveFormErrors, setSaveFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const orderedItems = useMemo(
    () => [...canvasItems].sort((left, right) => left.zIndex - right.zIndex),
    [canvasItems]
  );

  useEffect(() => {
    if (open) {
      setSaveFormData(initialValues);
      setSaveFormErrors({});
      setSubmitError("");
    }
  }, [initialValues, open]);

  const resetSaveFlow = () => {
    setSaveFormData(initialValues);
    setSaveFormErrors({});
    setSubmitError("");
    onClose();
  };
  const handleRequestClose = isSaving ? () => {} : resetSaveFlow;

  const handleSaveFormChange = (field, value) => {
    setSaveFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaveFormErrors((prev) => {
      if (!prev[field]) return prev;
      return {
        ...prev,
        [field]: "",
      };
    });

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmitOutfit = async () => {
    const nextErrors = {};

    if (!saveFormData.name.trim()) {
      nextErrors.name = "Outfit name is required";
    }

    if (orderedItems.length === 0) {
      setSubmitError("Add at least one item before saving this outfit.");
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
      setSaveFormErrors(nextErrors);
      return;
    }

    try {
      await onSubmit(saveFormData);
      resetSaveFlow();
    } catch (error) {
      setSubmitError(
        error?.message || "Could not save the outfit. Please try again."
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleRequestClose}
      title={title}
      className={styles.modalLarge}
    >
      <div className={styles.content}>
        <div className={styles.fieldsGrid}>
          <Input
            label="Outfit Name"
            name="name"
            value={saveFormData.name}
            onChange={(event) =>
              handleSaveFormChange("name", event.target.value)
            }
            placeholder="Enter outfit name"
            required
            error={saveFormErrors.name}
          />

          <SelectInput
            label="Occasion"
            name="occasion"
            value={saveFormData.occasion}
            onChange={(event) =>
              handleSaveFormChange("occasion", event.target.value)
            }
            options={OCCASION_OPTIONS}
            placeholder="Select occasion"
          />

          <SelectInput
            label="Season"
            name="season"
            value={saveFormData.season}
            onChange={(event) =>
              handleSaveFormChange("season", event.target.value)
            }
            options={SEASON_OPTIONS}
            placeholder="Select season"
          />

          <Input
            label="Notes"
            name="notes"
            value={saveFormData.notes}
            onChange={(event) =>
              handleSaveFormChange("notes", event.target.value)
            }
            placeholder="Add notes for this outfit"
          />
        </div>

        {submitError ? (
          <div className="rounded-2xl border border-[#f1cbc1] bg-[#fff3ef] px-4 py-3 text-sm text-[#9d5c4e]">
            {submitError}
          </div>
        ) : null}

        <div className={styles.bodyGrid}>
          <div className={styles.selectedCard}>
            <div className={styles.selectedHeader}>
              <div>
                <h3 className={styles.selectedTitle}>Canvas Items</h3>
                <p className={styles.selectedSubtitle}>
                  Saved in their current layer order from back to front.
                </p>
              </div>
              <div className={styles.selectedCount}>
                {orderedItems.length} item
                {orderedItems.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className={styles.selectedList}>
              {orderedItems.map((item, index) => (
                <div
                  key={`save-item-${item.instanceId}`}
                  className={styles.selectedItem}
                >
                  <ImageWithFallback
                    imageUrl={item.imageUrl}
                    alt={item.name}
                    fallbackText={item.name}
                    className={styles.selectedImageFrame}
                    imgClassName={styles.selectedImage}
                  />

                  <div className={styles.selectedText}>
                    <div className={styles.selectedName}>{item.name}</div>
                    <div className={styles.selectedCategory}>
                      {formatCapitalizedValue(item.category)}
                    </div>
                  </div>

                  <div className={styles.selectedMeta}>
                    <div className={styles.positionLabel}>item</div>
                    <div className={styles.positionValue}>{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.previewFrame}>
            <div className={styles.previewEyebrow}>Your Outfit Snapshot</div>
            {canvasSnapshot ? (
              <ImageWithFallback
                imageUrl={canvasSnapshot}
                alt="Outfit canvas snapshot"
                fallbackText="Outfit snapshot"
                className={styles.previewImageFrame}
                imgClassName={styles.previewImage}
              />
            ) : (
              <>
                <div className={styles.previewTitle}>
                  {snapshotError ? "Preview Unavailable" : "No Snapshot Yet"}
                </div>
                <p className={styles.previewText}>
                  {snapshotError ||
                    "Add items to the canvas and the current outfit arrangement will appear here before you save."}
                </p>
              </>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            onClick={resetSaveFlow}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSubmitOutfit}
            disabled={isSaving || orderedItems.length === 0}
          >
            {isSaving ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
