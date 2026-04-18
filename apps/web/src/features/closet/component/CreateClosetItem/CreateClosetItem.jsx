"use client";

import { Button } from "@/app/components/ui/actions";
import { Input, SelectInput } from "../../../../app/components/ui/forms";
import { Modal } from "../../../../app/components/ui/overlays";
import styles from "./CreateClosetItem.module.scss";
import { useRef, useState } from "react";
import { useCreateClosetItemMutation } from "../../hooks/useCreateClosetItemMutation";
import { useUploadItemImageMutation } from "../../hooks/useUploadItemImageMutations";
import { SEASON_OPTIONS } from "../../../../lib/static-data";
import { showErrorToast, showSuccessToast } from "../../../../lib/toast";

const initialFormData = {
  name: "",
  category: "",
  color: "",
  season: "",
  brand: "",
  price: 0,
  notes: "",
  store: "",
  material: "",
  dateAcquired: "2026-03-09",
};

export default function CreateClosetItem({ open, onClose }) {
  const createItemMutation = useCreateClosetItemMutation();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadItemImageMutation();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const isSubmitting = createItemMutation.isPending || isUploadingImage;

  const onChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.category.trim()) {
      newErrors = { ...newErrors, category: "Category is required" };
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const createdItem = await createItemMutation.mutateAsync(formData);

      if (file) {
        const imageFormData = new FormData();
        imageFormData.append("file", file);

        await uploadImage({
          itemId: createdItem.id,
          formData: imageFormData,
        });
      }

      showSuccessToast("Closet item created successfully.");
      handleClose();
    } catch (error) {
      showErrorToast(
        error?.response?.data?.detail ||
          error?.message ||
          "Could not create this closet item."
      );
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setFile(null);
    setPreviewUrl("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Closet Item"
      className={`${styles.modalBase} ${styles.modalLarge}`}
    >
      <div className={styles.modalContainer}>
        <div className="grid grid-cols-2 gap-x-16 gap-y-3.5">
          <Input
            type="text"
            label="Name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Enter item name"
            required={true}
            error={errors.name}
          />

          <Input
            type="text"
            label="Category"
            required={true}
            value={formData.category}
            onChange={(e) => onChange("category", e.target.value)}
            placeholder="Enter category"
            error={errors.category}
          />

          <Input
            type="text"
            label="Color"
            value={formData.color}
            onChange={(e) => onChange("color", e.target.value)}
            placeholder="Enter color name"
          />

          <SelectInput
            label="Season"
            value={formData.season}
            onChange={(e) => onChange("season", e.target.value)}
            options={SEASON_OPTIONS}
            placeholder="Select season"
          />

          <Input
            type="text"
            label="Brand"
            value={formData.brand}
            onChange={(e) => onChange("brand", e.target.value)}
            placeholder="Enter brand"
          />

          <Input
            type="number"
            label="Price"
            min={0}
            value={formData.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="Enter price $"
          />

          <Input
            type="textarea"
            label="Notes"
            value={formData.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Additional notes about the item"
          />

          <Input
            type="text"
            label="Store"
            value={formData.store}
            onChange={(e) => onChange("store", e.target.value)}
            placeholder="Enter store name"
          />

          <Input
            type="date"
            max={new Date().toISOString().split("T")[0]}
            label="Date Acquired"
            value={formData.dateAcquired}
            onChange={(e) => onChange("dateAcquired", e.target.value)}
            placeholder="Enter date acquired"
          />

          <Input
            type="text"
            label="Material"
            value={formData.material}
            onChange={(e) => onChange("material", e.target.value)}
            placeholder="Enter material (e.g., cotton, leather)"
          />

          <div className="col-span-1 my-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              type="button"
              variant="tertiary"
              size="lg"
              className="mt-4 w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="font-bold">
                {file ? "Change Image" : "Upload Image"}
              </span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 mt-8">
          {previewUrl && (
            <div className={styles.closetItemCard}>
              <img
                src={previewUrl}
                alt="closet item preview"
                className={styles.closetItemBox}
              />
            </div>
          )}

          <div>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText={
                isUploadingImage ? "Uploading image..." : "Saving item..."
              }
            >
              Add to Closet
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
