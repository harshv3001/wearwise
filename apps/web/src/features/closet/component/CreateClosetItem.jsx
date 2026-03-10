"use client";

import Button from "@/app/components/ui/Button";
import Input from "../../../app/components/ui/Input/Input";
import SelectInput from "../../../app/components/ui/SelectInput/SelectInput";
import Modal from "../../../app/components/ui/Modal/Modal";
import styles from "./CreateClosetItem.module.scss";
import { useState } from "react";
import { useCreateClosetItemMutation } from "../hooks/useCreateClosetItemMutation";

const initialFormData = {
  name: "",
  category: "",
  color: "",
  season: "",
  brand: "",
  price: 0,
  notes: "",
  store: "",
  dateAcquired: "2026-03-09",
};

export default function CreateClosetItem({ open, onClose }) {
  const createItemMutation = useCreateClosetItemMutation();

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  const onChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() && !formData.category.trim()) {
      setErrors({
        name: "Name is required",
        category: "Category is required",
      });
      return;
    } else if (!formData.category.trim()) {
      setErrors({ category: "Category is required" });
      return;
    } else if (!formData.name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    } else {
      try {
        const result = await createItemMutation.mutateAsync(formData);
        alert("Closet item created successfully!");
        handleClose();
      } catch (error) {
        console.error("Failed to create outfit:", error);
      }
    }
  };

  const handleClose = () => {
    setIsImageUploaded(false);
    setFormData(initialFormData);
    setErrors({});
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
        <div className="grid grid-cols-2 gap-x-16 gap-y-8">
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
            options={[
              { value: "all", label: "All Seasons" },
              { value: "spring", label: "Spring" },
              { value: "summer", label: "Summer" },
              { value: "fall", label: "Fall" },
              { value: "winter", label: "Winter" },
            ]}
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
          <div className="col-span-1 my-auto">
            <Button
              type="button"
              variant="tertiary"
              size="lg"
              className="mt-4 w-full"
              onClick={() => setIsImageUploaded((prev) => !prev)}
            >
              <span className="font-bold">Upload Image</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 mt-8">
          {isImageUploaded && (
            <div className={styles.closetItemCard}>
              <img
                src="brown-fall-jacket.jpg"
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
            >
              Add to Closet
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
