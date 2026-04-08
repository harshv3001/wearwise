"use client";

import Modal from "../../../components/ui/Modal/Modal.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input/Input.jsx";
import SelectInput from "../../../components/ui/SelectInput/SelectInput.jsx";
import ImageWithFallback from "../../../components/ui/ImageWithFallback/ImageWithFallback.jsx";
import { SEASON_OPTIONS } from "../../../../lib/static-data.js";
import { formatCapitalizedValue } from "../../../../lib/helperFunctions.js";
import styles from "./SaveOutfitModal.module.scss";
import { useCreateOutfitMutation } from "@/features/outfits/hooks/useCreateOutfitMutation.js";
import { useState } from "react";

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

export default function SaveOutfitModal({ open, onClose, selectedItems }) {
  const [saveFormData, setSaveFormData] = useState(INITIAL_SAVE_FORM_DATA);
  const [saveFormErrors, setSaveFormErrors] = useState({});

  const createOutfitMutation = useCreateOutfitMutation();

  const resetSaveFlow = () => {
    setSaveFormData(INITIAL_SAVE_FORM_DATA);
    setSaveFormErrors({});
    onClose();
  };

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
  };

  const handleSubmitOutfit = async () => {
    const nextErrors = {};

    if (!saveFormData.name.trim()) {
      nextErrors.name = "Outfit name is required";
    }

    if (selectedItems.length === 0) {
      alert("Select at least one item before saving the outfit.");
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
      setSaveFormErrors(nextErrors);
      return;
    }

    const payload = {
      name: saveFormData.name.trim(),
      occasion: saveFormData.occasion || null,
      season: saveFormData.season || null,
      notes: saveFormData.notes.trim() || null,
      is_favorite: false,
      items: selectedItems.map((item) => ({
        closet_item_id: item.id,
        position: item.position,
        layer: item.layer,
        note: null,
      })),
    };

    console.log("Submitting outfit with payload:", payload);
    try {
      await createOutfitMutation.mutateAsync(payload);
      alert("Outfit saved successfully!");
      resetSaveFlow();
    } catch (error) {
      console.error("Failed to save outfit:", error);
      alert("Could not save the outfit. Please try again.");
    }
  };

  const isSaving = createOutfitMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save Outfit"
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

        <div className={styles.bodyGrid}>
          <div className={styles.selectedCard}>
            <div className={styles.selectedHeader}>
              <div>
                <h3 className={styles.selectedTitle}>Selected Items</h3>
                <p className={styles.selectedSubtitle}>
                  Ordered exactly as they will be saved in this outfit.
                </p>
              </div>
              <div className={styles.selectedCount}>
                {selectedItems.length} item
                {selectedItems.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className={styles.selectedList}>
              {selectedItems.map((item) => (
                <div
                  key={`save-item-${item.id}`}
                  className={styles.selectedItem}
                >
                  <ImageWithFallback
                    imageUrl={item.image_url}
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
                    <div className={styles.positionLabel}>Position</div>
                    <div className={styles.positionValue}>{item.position}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.previewFrame}>
            <div className={styles.previewEyebrow}>Outfit Preview</div>
            <div className={styles.previewTitle}>Preview Coming Soon</div>
            <p className={styles.previewText}>
              This panel is ready for the future layered outfit preview. For
              now, your selected items on the left define the saved order.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSubmitOutfit}
            disabled={isSaving || selectedItems.length === 0}
          >
            {isSaving ? "Saving..." : "Save Outfit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
