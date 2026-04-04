"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input/Input";
import SelectInput from "@/app/components/ui/SelectInput/SelectInput";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback/ImageWithFallback";
import { useUpdateClosetItemMutation } from "../hooks/useUpdateClosetItemMutation";
import { useUploadItemImageMutation } from "../hooks/useUploadItemImageMutations";
import styles from "./ClosetDetails.module.scss";
import { SEASON_OPTIONS } from "../../../lib/static-data";
import {
  formatCurrency,
  formatDate,
  formatDisplayValue,
} from "../../../lib/helperFunctions";

// ─── Pure helpers (no closure over component state) ───────────────────────────

const EMPTY_FORM = {
  name: "",
  category: "",
  brand: "",
  color: "",
  material: "",
  store: "",
  date_acquired: "",
  season: "",
  price: "",
  times_worn: "",
  notes: "",
};

const DETAIL_SECTIONS = [
  { key: "name", label: "Name", type: "text" },
  {
    key: "category",
    label: "Category",
    type: "text",
  },
  { key: "brand", label: "Brand", type: "text" },
  { key: "color", label: "Color", type: "text" },
  { key: "material", label: "Material", type: "text" },
  { key: "store", label: "Store", type: "text" },
  {
    key: "date_acquired",
    label: "Purchased On",
    type: "date",
    format: formatDate,
  },
  {
    key: "season",
    label: "Season",
    type: "select",
    options: SEASON_OPTIONS,
  },
  {
    key: "price",
    label: "Price",
    type: "number",
    format: formatCurrency,
  },
  { key: "times_worn", label: "Times Worn", type: "number" },
  { key: "notes", label: "Notes", type: "text" },
];

function formatTitle(name) {
  return name ? `${name} Details` : "Closet Item Details";
}

function buildFormData(item) {
  if (!item) return EMPTY_FORM;
  return {
    name: item.name ?? "",
    category: item.category ?? "",
    brand: item.brand ?? "",
    color: item.color ?? "",
    material: item.material ?? "",
    store: item.store ?? "",
    date_acquired: item.date_acquired ?? "",
    season: item.season ?? "",
    price: item.price ?? "",
    times_worn: item.times_worn ?? "",
    notes: item.notes ?? "",
  };
}

function normalizePayload(formData) {
  return {
    ...formData,
    price:
      formData.price === "" || formData.price === null
        ? 0
        : Number(formData.price),
    times_worn:
      formData.times_worn === "" || formData.times_worn === null
        ? 0
        : Number(formData.times_worn),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  isEditing,
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <Input
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      readOnly={!isEditing}
      placeholder={placeholder}
      inputClassName={isEditing ? styles.editableInput : styles.displayInput}
      className={styles.field}
    />
  );
}

function renderField({ field, isEditing, value, onChange }) {
  if (isEditing && field.type === "select") {
    return (
      <SelectInput
        key={field.key}
        label={field.label}
        name={field.key}
        value={value}
        onChange={onChange}
        options={field.options}
        placeholder={`Select ${field.label.toLowerCase()}`}
        className={styles.field}
        selectClassName={styles.editableInput}
      />
    );
  }

  const displayValue = isEditing
    ? value ?? ""
    : field.format
    ? field.format(value)
    : formatDisplayValue(value);

  return (
    <Field
      key={field.key}
      isEditing={isEditing}
      label={field.label}
      name={field.key}
      type={isEditing ? field.type : "text"}
      value={displayValue}
      onChange={onChange}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ClosetDetails({ item }) {
  const updateClosetItemMutation = useUpdateClosetItemMutation();
  const uploadItemImageMutation = useUploadItemImageMutation();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => buildFormData(item));

  useEffect(() => {
    setFormData(buildFormData(item));
  }, [item]);

  const originalPayload = useMemo(
    () => normalizePayload(buildFormData(item)),
    [item]
  );

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCancel = useCallback(() => {
    setFormData(buildFormData(item));
    setIsEditing(false);
  }, [item]);

  const handleSubmit = useCallback(async () => {
    if (!item?.id) return;

    const payload = normalizePayload(formData);

    if (JSON.stringify(payload) === JSON.stringify(originalPayload)) {
      setIsEditing(false);
      return;
    }

    await updateClosetItemMutation.mutateAsync({ itemId: item.id, payload });
    setIsEditing(false);
  }, [item, formData, originalPayload, updateClosetItemMutation]);

  const handleImageChange = useCallback(
    async (event) => {
      const selectedFile = event.target.files?.[0];

      if (!selectedFile || !item?.id) {
        return;
      }

      const imageFormData = new FormData();
      imageFormData.append("file", selectedFile);

      await uploadItemImageMutation.mutateAsync({
        itemId: item.id,
        formData: imageFormData,
      });

      event.target.value = "";
    },
    [item, uploadItemImageMutation]
  );

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{formatTitle(item?.name)}</h1>

        <div className={styles.headerActions}>
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                onClick={handleCancel}
                className={styles.actionButton}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={updateClosetItemMutation.isPending}
                className={styles.actionButton}
              >
                {updateClosetItemMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                edit
              </span>
              Edit Details
            </Button>
          )}
        </div>
      </div>

      <div className={styles.detailsCard}>
        <div className={styles.imageColumn}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleImageChange}
          />

          <div className={styles.imageFrame}>
            <ImageWithFallback
              imageUrl={item?.image_url}
              alt={item?.name || "Closet item"}
              fallbackText={item?.name || "Closet item"}
              className={styles.imageFill}
              imgClassName={styles.imageFill}
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadItemImageMutation.isPending}
            className={styles.changeImageButton}
          >
            {uploadItemImageMutation.isPending
              ? "Updating Image..."
              : item?.image_url
              ? "Change Image"
              : "Add Image"}
          </Button>

          <div className={styles.metaList}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Price</span>
              <span className={styles.metaValue}>
                {formatCurrency(item?.price)}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Times Worn</span>
              <span className={styles.metaValue}>
                {formatDisplayValue(item?.times_worn)}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Notes</span>
              <span className={styles.metaValue}>
                {formatDisplayValue(item?.notes)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.formColumn}>
          <div className={styles.formGrid}>
            {DETAIL_SECTIONS.map((field) =>
              renderField({
                field,
                isEditing,
                value: formData[field.key],
                onChange: (e) => handleChange(field.key, e.target.value),
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
