"use client";

import Button from "@/app/components/ui/Button";
import Input from "../../../app/components/ui/Input/Input";
import SelectInput from "../../../app/components/ui/SelectInput/SelectInput";
import Modal from "../../../app/components/ui/Modal/Modal";
import styles from "./CreateClosetItem.module.scss";

export default function CreateClosetItem({
  formData,
  onChange,
  errors,
  open,
  onClose,
}) {
  const createItemMutation = useCreateItemMutation();
  const updateItemMutation = useUpdateItemMutation();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    season: "",
    brand: "",
    price: 0,
    notes: "",
    store: "",
    dateAcquired: "2026-03-09",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }

    try {
      console.log("Submitting outfit:", formData);
      await createItemMutation.mutateAsync(formData);
      onClose();
    } catch (error) {
      console.error("Failed to create outfit:", error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create Closet Item">
      <div className="grid grid-cols-2 gap-x-16 gap-y-8">
        <Input
          type="text"
          label="Name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Enter outfit name"
          required={true}
          error={errors.name}
        />

        <Input
          type="text"
          label="Category"
          value={formData.category}
          onChange={(e) => onChange("category", e.target.value)}
          placeholder="Enter category"
        />

        <Input
          type="text"
          label="Color"
          value={formData.color}
          onChange={(e) => onChange("color", e.target.value)}
          placeholder="Enter color"
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
          value={formData.price}
          onChange={(e) => onChange("price", e.target.value)}
          placeholder="Enter price"
        />

        <Input
          type="textarea"
          label="Notes"
          value={formData.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Additional notes about the outfit"
        />

        <Input
          type="text"
          label="Store"
          value={formData.store}
          onChange={(e) => onChange("store", e.target.value)}
          placeholder="Enter store"
        />

        <Input
          type="date"
          label="Date Acquired"
          value={formData.dateAcquired}
          onChange={(e) => onChange("dateAcquired", e.target.value)}
          placeholder="Enter date acquired"
        />

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSubmit}
        >
          Submit Item
        </Button>
      </div>
    </Modal>
  );
}
