"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/actions";
import { ImageWithFallback } from "../../../components/ui/display";
import { Skeleton } from "../../../components/ui/feedback";
import { Input, SelectInput } from "../../../components/ui/forms";
import { Modal } from "../../../components/ui/overlays";
import { SEASON_OPTIONS } from "../../../../lib/static-data.js";
import { formatCapitalizedValue } from "../../../../lib/helperFunctions.js";
import { showErrorToast, showWarningToast } from "../../../../lib/toast.js";
import styles from "./SaveOutfitModal.module.scss";
import ReportOutfitStepDate from "@/features/outfits/components/ReportOutfitStepDate";
import { useSubmitWearLog } from "@/features/report/hooks/useSubmitWearLog";

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
  onSuccess,
}) {
  const [saveFormData, setSaveFormData] = useState(initialValues);
  const [saveFormErrors, setSaveFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [savedOutfitId, setSavedOutfitId] = useState(null);
  const { submitWearLog, isPending: isReportingOutfit } = useSubmitWearLog();

  const orderedItems = useMemo(
    () => [...canvasItems].sort((left, right) => left.zIndex - right.zIndex),
    [canvasItems]
  );
  const showSnapshotSkeleton =
    open && orderedItems.length > 0 && !canvasSnapshot && !snapshotError;
  const isSubmitting = isSaving || isReportingOutfit;
  const isOutfitAlreadySaved = Boolean(savedOutfitId);

  useEffect(() => {
    if (open) {
      setSaveFormData(initialValues);
      setSaveFormErrors({});
      setSubmitError("");
      setIsDateModalOpen(false);
      setSelectedDate("");
      setSavedOutfitId(null);
    }
  }, [initialValues, open]);

  const resetSaveFlow = () => {
    setSaveFormData(initialValues);
    setSaveFormErrors({});
    setSubmitError("");
    setIsDateModalOpen(false);
    setSelectedDate("");
    setSavedOutfitId(null);
    onClose();
  };
  const handleRequestClose = isSubmitting ? () => {} : resetSaveFlow;

  const handleSaveFormChange = (field, value) => {
    if (isOutfitAlreadySaved) {
      return;
    }

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

  const handleSaveError = (error) => {
    const detail =
      error?.message || "Could not save the outfit. Please try again.";

    showErrorToast(detail);
    setSubmitError(detail);
  };

  const validateSaveForm = () => {
    const nextErrors = {};

    if (!saveFormData.name.trim()) {
      nextErrors.name = "Outfit name is required";
    }

    if (orderedItems.length === 0) {
      setSubmitError("Add at least one item before saving this outfit.");
      return false;
    }

    if (Object.keys(nextErrors).length > 0) {
      setSaveFormErrors(nextErrors);
      return false;
    }

    return true;
  };

  const saveOutfitAndGetId = async () => {
    if (savedOutfitId) {
      return savedOutfitId;
    }

    const savedOutfit = await onSubmit(saveFormData);
    const nextSavedOutfitId = savedOutfit?.id;

    setSavedOutfitId(nextSavedOutfitId);

    return nextSavedOutfitId;
  };

  const handleSubmitOutfit = async () => {
    if (!validateSaveForm()) {
      return;
    }

    if (isOutfitAlreadySaved) {
      if (onSuccess) {
        onSuccess();
      } else {
        resetSaveFlow();
      }
      return;
    }

    try {
      await saveOutfitAndGetId();
      if (onSuccess) {
        onSuccess();
      } else {
        resetSaveFlow();
      }
    } catch (error) {
      handleSaveError(error);
    }
  };

  const handleOpenDateModal = () => {
    if (!validateSaveForm()) {
      return;
    }

    setSubmitError("");
    setIsDateModalOpen(true);
  };

  const handleSubmitAndReportOutfit = async () => {
    if (!selectedDate) {
      showWarningToast("Please select a date to log this outfit.");
      return;
    }

    if (!validateSaveForm()) {
      return;
    }

    const reportErrorMessage = isOutfitAlreadySaved
      ? "Could not log this outfit. Please try again."
      : "Outfit was saved, but could not be logged. Please try again.";

    let outfitId = savedOutfitId;

    try {
      if (!outfitId) {
        outfitId = await saveOutfitAndGetId();
      }
    } catch (error) {
      handleSaveError(error);
      return;
    }

    try {
      const result = await submitWearLog({
        outfitId,
        selectedDate,
        successMessage: "Outfit saved and logged successfully.",
        errorMessage: reportErrorMessage,
      });

      if (result?.wear_log_id) {
        if (onSuccess) {
          onSuccess();
        } else {
          resetSaveFlow();
        }
      }
    } catch (error) {
      setSubmitError(error?.message || reportErrorMessage);
    }
  };

  return (
    <>
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
              disabled={isSubmitting || isOutfitAlreadySaved}
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
              disabled={isSubmitting || isOutfitAlreadySaved}
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
              disabled={isSubmitting || isOutfitAlreadySaved}
            />

            <Input
              label="Notes"
              name="notes"
              value={saveFormData.notes}
              onChange={(event) =>
                handleSaveFormChange("notes", event.target.value)
              }
              placeholder="Add notes for this outfit"
              disabled={isSubmitting || isOutfitAlreadySaved}
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
              ) : showSnapshotSkeleton ? (
                <Skeleton
                  className={styles.previewImageFrame}
                  height={320}
                  width="100%"
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmitOutfit}
              disabled={
                isSubmitting ||
                orderedItems.length === 0 ||
                isOutfitAlreadySaved
              }
              loading={isSaving}
              loadingText="Saving outfit..."
            >
              {isOutfitAlreadySaved ? "Outfit saved" : submitLabel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenDateModal}
              disabled={isSubmitting || orderedItems.length === 0}
            >
              {isOutfitAlreadySaved
                ? "Log saved outfit"
                : "Save and log outfit"}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={isDateModalOpen}
        onClose={isSubmitting ? () => {} : () => setIsDateModalOpen(false)}
        className={`${styles.modalSmall} bg-yellow-50!`}
      >
        <>
          <ReportOutfitStepDate
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmitAndReportOutfit}
              disabled={isSubmitting}
              loading={isSubmitting}
              loadingText={isSaving ? "Saving outfit..." : "Logging outfit..."}
            >
              Log outfit
            </Button>
          </div>
        </>
      </Modal>
    </>
  );
}
