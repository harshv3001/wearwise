"use client";

import { useMemo, useState } from "react";
import Button from "@/app/components/ui/Button";
import Input from "../../../app/components/ui/Input/Input";
import SelectInput from "../../../app/components/ui/SelectInput/SelectInput";
import Modal from "../../../app/components/ui/Modal/Modal";
import styles from "./CreateOutfit.module.scss";
// import { useCreateOutfitMutation } from "../hooks/useCreateOutfitMutation";

const initialFormData = {
  name: "",
  occasion: "",
  season: "",
  is_favorite: false,
  notes: "",
};

export default function CreateOutfit({
  open,
  onClose,
  previewImage,
  activeCategories = [],
  selectedItemsByCategory = {},
}) {
  // const createOutfitMutation = useCreateOutfitMutation();

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const selectedItemsPayload = useMemo(() => {
    return activeCategories
      .map((categoryName, rowIndex) => {
        const selectedItem = selectedItemsByCategory[categoryName];

        if (!selectedItem?.id) return null;

        return {
          closet_item_id: selectedItem.id,
          position: rowIndex,
        };
      })
      .filter(Boolean);
  }, [activeCategories, selectedItemsByCategory]);

  const onChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Outfit name is required";
    }

    if (selectedItemsPayload.length === 0) {
      newErrors.items = "Please select at least one outfit item";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: formData.name,
      occasion: formData.occasion || null,
      season: formData.season || null,
      is_favorite: formData.is_favorite,
      notes: formData.notes || null,
      items: selectedItemsPayload,
    };

    console.log("Create outfit payload:", payload);

    try {
      // await createOutfitMutation.mutateAsync(payload);
      alert("Outfit created successfully!");
      handleClose();
    } catch (error) {
      console.error("Failed to create outfit:", error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Outfit"
      className={`${styles.modalBase} ${styles.modalLarge}`}
    >
      <div className={styles.modalContainer}>
        <div className="grid grid-cols-2 gap-x-16 gap-y-8">
          <div className="flex flex-col gap-6">
            <Input
              type="text"
              label="Outfit Name"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Enter outfit name"
              required={true}
              error={errors.name}
            />

            <Input
              type="text"
              label="Occasion"
              value={formData.occasion}
              onChange={(e) => onChange("occasion", e.target.value)}
              placeholder="Enter occasion"
            />

            <SelectInput
              label="Season"
              value={formData.season}
              onChange={(e) => onChange("season", e.target.value)}
              options={[
                { value: "spring", label: "Spring" },
                { value: "summer", label: "Summer" },
                { value: "fall", label: "Fall" },
                { value: "winter", label: "Winter" },
              ]}
              placeholder="Select season"
            />

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_favorite}
                onChange={(e) => onChange("is_favorite", e.target.checked)}
              />
              <span>Mark as favorite</span>
            </label>

            <Input
              type="textarea"
              label="Notes"
              value={formData.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Additional notes about the outfit"
            />

            {errors.items && (
              <p className="text-sm text-red-500">{errors.items}</p>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className={styles.title}>Preview</div>

            {previewImage ? (
              <div className={styles.outfitPreviewCard}>
                <img
                  src={previewImage}
                  alt="outfit preview"
                  className={styles.outfitPreviewImage}
                />
              </div>
            ) : (
              <div className={styles.outfitPreviewCard}>
                <div className={styles.outfitPreviewImage} />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleSubmit}
          >
            Save Outfit
          </Button>
        </div>
      </div>
    </Modal>
  );
}
