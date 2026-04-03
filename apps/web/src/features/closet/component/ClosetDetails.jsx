"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input/Input";
import SelectInput from "@/app/components/ui/SelectInput/SelectInput";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback/ImageWithFallback";
import { useUpdateClosetItemMutation } from "../hooks/useUpdateClosetItemMutation";
import styles from "./ClosetDetails.module.scss";
import { SEASON_OPTIONS } from "../../../lib/static-data";

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

function formatTitle(name) {
  if (!name) return "Closet Item Details";
  return `${name} Details`;
}

function formatDisplayValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const amount = Number(value);
  return Number.isNaN(amount) ? String(value) : `$${amount}`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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

function getFieldValue(fieldKey, value, isEditing) {
  if (isEditing) {
    return value ?? "";
  }

  if (fieldKey === "price") {
    return formatCurrency(value);
  }

  if (fieldKey === "date_acquired") {
    return formatDate(value);
  }

  return formatDisplayValue(value);
}

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

export default function ClosetDetails({ item }) {
  const updateClosetItemMutation = useUpdateClosetItemMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => buildFormData(item));

  useEffect(() => {
    setFormData(buildFormData(item));
  }, [item]);

  const detailSections = useMemo(
    () => [
      { key: "name", label: "Name", type: "text" },
      { key: "category", label: "Category", type: "select-category" },
      { key: "brand", label: "Brand", type: "text" },
      { key: "color", label: "Color", type: "text" },
      { key: "material", label: "Material", type: "text" },
      { key: "store", label: "Store", type: "text" },
      { key: "date_acquired", label: "Purchased On", type: "date" },
      { key: "season", label: "Season", type: "select-season" },
      { key: "price", label: "Price", type: "number" },
      { key: "times_worn", label: "Times Worn", type: "number" },
    ],
    []
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setFormData(buildFormData(item));
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!item?.id) return;

    const payload = {
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

    await updateClosetItemMutation.mutateAsync({
      itemId: item.id,
      payload,
    });

    setIsEditing(false);
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{formatTitle(item?.name)}</h1>

        <div className={styles.headerActions}>
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="default"
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
              variant="default"
              size="sm"
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                edit
              </span>
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className={styles.detailsCard}>
        <div className={styles.imageColumn}>
          <div className={styles.imageFrame}>
            <ImageWithFallback
              imageUrl={item?.image_url}
              alt={item?.name || "Closet item"}
              fallbackText={item?.name || "Closet item"}
              className={styles.imageFill}
              imgClassName={styles.imageFill}
            />
          </div>

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
            {detailSections.map((field) => {
              if (isEditing && field.type === "select-season") {
                return (
                  <SelectInput
                    key={field.key}
                    label={field.label}
                    name={field.key}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    options={SEASON_OPTIONS}
                    placeholder="Select season"
                    className={styles.field}
                    selectClassName={styles.editableInput}
                  />
                );
              }

              return (
                <Field
                  key={field.key}
                  isEditing={isEditing}
                  label={field.label}
                  name={field.key}
                  type={
                    isEditing && field.type !== "select-season"
                      ? field.type
                      : "text"
                  }
                  value={getFieldValue(
                    field.key,
                    formData[field.key],
                    isEditing
                  )}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              );
            })}

            <Field
              isEditing={isEditing}
              label="Notes"
              name="notes"
              value={
                isEditing ? formData.notes : formatDisplayValue(formData.notes)
              }
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Add notes"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
