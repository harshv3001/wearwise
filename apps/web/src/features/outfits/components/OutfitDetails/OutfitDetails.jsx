"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button/Button";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback/ImageWithFallback";
import EditableDetailField from "@/app/components/ui/EditableDetailField/EditableDetailField";
import { useUpdateOutfitMutation } from "../../hooks/useUpdateOutfitMutation";
import { useUploadOutfitImageMutation } from "../../hooks/useUploadOutfitImageMutation";
import {
  SEASON_OPTIONS,
  OCCASION_OPTIONS,
  FAVORITE_OPTIONS,
} from "../../../../lib/static-data";
import {
  formatCapitalizedValue,
  formatDate,
  formatDisplayValue,
} from "../../../../lib/helperFunctions";
import { showErrorToast, showSuccessToast } from "../../../../lib/toast";
import styles from "./OutfitDetails.module.scss";

const DETAIL_FIELDS = [
  { key: "name", label: "Outfit Name", type: "text" },
  {
    key: "occasion",
    label: "Occasion",
    type: "select",
    options: OCCASION_OPTIONS,
    format: formatCapitalizedValue,
  },
  {
    key: "season",
    label: "Season",
    type: "select",
    options: SEASON_OPTIONS,
    format: formatCapitalizedValue,
  },
  { key: "notes", label: "Notes", type: "text" },
  {
    key: "is_favorite",
    label: "Favorite",
    type: "radio",
    options: FAVORITE_OPTIONS,
    format: (value) => (value ? "Yes" : "No"),
  },
  {
    key: "created_at",
    label: "Created",
    type: "datetime",
    alwaysReadOnly: true,
    format: formatDate,
  },
  {
    key: "updated_at",
    label: "Updated",
    type: "datetime",
    alwaysReadOnly: true,
    format: formatDate,
  },
];

function buildFormData(outfit) {
  return {
    name: outfit?.name ?? "",
    occasion: outfit?.occasion ?? "",
    season: outfit?.season ?? "",
    notes: outfit?.notes ?? "",
    is_favorite: outfit?.is_favorite ?? false,
    created_at: outfit?.created_at ?? "",
    updated_at: outfit?.updated_at ?? "",
  };
}

function formatTitle(name) {
  return name ? `${name} Details` : "Outfit Details";
}

export default function OutfitDetails({ outfit }) {
  const router = useRouter();
  const updateOutfitMutation = useUpdateOutfitMutation();
  const uploadOutfitImageMutation = useUploadOutfitImageMutation();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => buildFormData(outfit));
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setFormData(buildFormData(outfit));
    setIsEditing(false);
    setSubmitError("");
  }, [outfit]);

  const orderedItems = useMemo(() => {
    return [...(outfit?.items || [])].sort((left, right) => {
      if ((left?.position ?? 0) !== (right?.position ?? 0)) {
        return (left?.position ?? 0) - (right?.position ?? 0);
      }

      return (left?.layer ?? 0) - (right?.layer ?? 0);
    });
  }, [outfit?.items]);

  const originalFormData = useMemo(() => buildFormData(outfit), [outfit]);

  const handleChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (submitError) {
        setSubmitError("");
      }
    },
    [submitError]
  );

  const handleCancel = useCallback(() => {
    setFormData(buildFormData(outfit));
    setIsEditing(false);
    setSubmitError("");
  }, [outfit]);

  const handleSubmit = useCallback(async () => {
    if (!outfit?.id) return;

    if (!formData.name.trim()) {
      setSubmitError("Outfit name is required.");
      return;
    }

    if (JSON.stringify(formData) === JSON.stringify(originalFormData)) {
      setIsEditing(false);
      return;
    }

    try {
      await updateOutfitMutation.mutateAsync({
        outfitId: outfit.id,
        payload: {
          name: formData.name.trim(),
          occasion: formData.occasion || null,
          season: formData.season || null,
          notes: formData.notes.trim(),
          is_favorite: formData.is_favorite,
        },
      });

      setIsEditing(false);
      setSubmitError("");
      showSuccessToast("Outfit updated successfully.");
    } catch (error) {
      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        "Could not update this outfit.";
      setSubmitError("");
      showErrorToast(detail);
    }
  }, [formData, originalFormData, outfit, updateOutfitMutation]);

  const handleImageChange = useCallback(
    async (event) => {
      const selectedFile = event.target.files?.[0];

      if (!selectedFile || !outfit?.id) {
        return;
      }

      const imageFormData = new FormData();
      imageFormData.append("file", selectedFile);

      try {
        await uploadOutfitImageMutation.mutateAsync({
          outfitId: outfit.id,
          formData: imageFormData,
        });
        setSubmitError("");
        showSuccessToast(
          outfit?.image_url
            ? "Outfit image updated successfully."
            : "Outfit image uploaded successfully."
        );
      } catch (error) {
        const detail =
          error?.response?.data?.detail ||
          error?.message ||
          "Could not update the outfit image.";
        setSubmitError("");
        showErrorToast(detail);
      } finally {
        event.target.value = "";
      }
    },
    [outfit, uploadOutfitImageMutation]
  );

  if (!outfit) {
    return null;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.eyebrow}>Outfit Overview</div>
          <h1 className={styles.title}>{formatTitle(outfit?.name)}</h1>
        </div>

        <div className={styles.headerActions}>
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            onClick={() => router.push(`/outfit-generator/edit/${outfit.id}`)}
            className={styles.actionButton}
          >
            Edit Canvas
          </Button>
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
                loading={updateOutfitMutation.isPending}
                loadingText="Saving..."
                className={styles.actionButton}
              >
                Save
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
        {submitError ? (
          <div className={styles.statusMessage}>{submitError}</div>
        ) : null}

        <div className={styles.bodyGrid}>
          <div className={styles.fieldsGrid}>
            {DETAIL_FIELDS.map((field) => (
              <EditableDetailField
                key={field.key}
                field={field}
                isEditing={isEditing}
                value={formData[field.key]}
                onChange={(event) =>
                  handleChange(
                    field.key,
                    field.key === "is_favorite"
                      ? event.target.value === "true"
                      : event.target.value
                  )
                }
                className={styles.field}
                displayInputClassName={styles.displayInput}
                editableInputClassName={styles.editableInput}
              />
            ))}
          </div>

          <div className={styles.selectedCard}>
            <div className={styles.selectedHeader}>
              <div>
                <h2 className={styles.selectedTitle}>Outfit Items</h2>
                <p className={styles.selectedSubtitle}>
                  Current outfit pieces in saved layer order. Closet item
                  editing is read-only here for now.
                </p>
              </div>
              <div className={styles.selectedCount}>
                {orderedItems.length} item{orderedItems.length === 1 ? "" : "s"}
              </div>
            </div>

            {orderedItems.length > 0 ? (
              <div className={styles.selectedList}>
                {orderedItems.map((item, index) => {
                  const closetItem = item?.closet_item;

                  return (
                    <div
                      key={`outfit-item-${item.id || closetItem?.id || index}`}
                      className={styles.selectedItem}
                    >
                      <ImageWithFallback
                        imageUrl={closetItem?.image_url}
                        alt={closetItem?.name || "Closet item"}
                        fallbackText={closetItem?.name || "Item"}
                        className={styles.selectedImageFrame}
                        imgClassName={styles.selectedImage}
                      />
                      <div className="flex justify-between m-2">
                        <div className={styles.selectedText}>
                          <div className={styles.selectedName}>
                            {formatDisplayValue(
                              closetItem?.name,
                              "Unnamed Item"
                            )}
                          </div>
                          <div className={styles.selectedCategory}>
                            {[
                              formatCapitalizedValue(closetItem?.category, ""),
                              formatCapitalizedValue(closetItem?.color, ""),
                            ]
                              .filter(Boolean)
                              .join(" · ") || "No category details"}
                          </div>
                        </div>

                        <div className={styles.selectedMeta}>
                          <div className={styles.positionLabel}>Item</div>
                          <div className={styles.positionValue}>
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                No closet items are attached to this outfit yet.
              </div>
            )}
          </div>
        </div>
        <div className={styles.previewFrame}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleImageChange}
          />

          <div className={styles.previewEyebrow}>Outfit Snapshot</div>

          {outfit?.image_url ? (
            <ImageWithFallback
              imageUrl={outfit.image_url}
              alt={outfit?.name || "Outfit snapshot"}
              fallbackText={outfit?.name || "Outfit snapshot"}
              className={styles.previewImageFrame}
              imgClassName={styles.previewImage}
            />
          ) : (
            <>
              <div className={styles.previewTitle}>No Image Yet</div>
              <p className={styles.previewText}>
                Upload an outfit image while editing to give this look a saved
                visual preview.
              </p>
            </>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isEditing || uploadOutfitImageMutation.isPending}
            className={styles.changeImageButton}
          >
            {uploadOutfitImageMutation.isPending
              ? "Updating Image..."
              : outfit?.image_url
              ? "Change Image"
              : "Add Image"}
          </Button>
        </div>
      </div>
    </section>
  );
}
