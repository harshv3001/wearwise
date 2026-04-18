"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/app/components/ui/actions";
import { useClosetItemsQuery } from "@/features/closet/hooks/useClosetItemsQuery.js";
import { useCreateOutfitMutation } from "@/features/outfits/hooks/useCreateOutfitMutation.js";
import { useUpdateOutfitMutation } from "@/features/outfits/hooks/useUpdateOutfitMutation.js";
import { useUploadOutfitImageMutation } from "@/features/outfits/hooks/useUploadOutfitImageMutation.js";
import { groupClosetItemsByCategory } from "@/app/components/closet/closetCategoryUtils.js";
import SaveOutfitModal from "./SaveOutfitModal.jsx";
import ClosetSidebar from "./ClosetSidebar.jsx";
import OutfitActionsBar from "./OutfitActionsBar.jsx";
import OutfitBuilderWorkspaceSkeleton from "./OutfitBuilderWorkspaceSkeleton.jsx";
import { useOutfitCanvasState } from "../hooks/useOutfitCanvasState.js";
import {
  buildCanvasItemsFromOutfit,
  buildOutfitSavePayload,
  buildOutfitSnapshotFilename,
  dataUrlToFile,
} from "../utils/outfitCanvasUtils.js";
import { showSuccessToast } from "../../../../lib/toast.js";
import styles from "../page.module.scss";

const OutfitCanvas = dynamic(() => import("./OutfitCanvas.jsx"), {
  ssr: false,
});

const EMPTY_METADATA = {
  name: "",
  occasion: "",
  season: "",
  notes: "",
  is_favorite: false,
};

function buildMetadataDefaults(outfit) {
  if (!outfit) {
    return EMPTY_METADATA;
  }

  return {
    name: outfit.name || "",
    occasion: outfit.occasion || "",
    season: outfit.season || "",
    notes: outfit.notes || "",
    is_favorite: Boolean(outfit.is_favorite),
  };
}

export default function OutfitBuilderWorkspace({
  mode = "create",
  initialOutfit = null,
  isInitialLoading = false,
}) {
  const isEditMode = mode === "edit";
  const hydratedOutfitIdRef = useRef(null);
  const { data: allClosetItems, isLoading: isClosetLoading } =
    useClosetItemsQuery();
  const createOutfitMutation = useCreateOutfitMutation();
  const updateOutfitMutation = useUpdateOutfitMutation();
  const uploadOutfitImageMutation = useUploadOutfitImageMutation();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [canvasError, setCanvasError] = useState("");
  const [canvasSnapshot, setCanvasSnapshot] = useState("");
  const [snapshotError, setSnapshotError] = useState("");
  const [snapshotRequestId, setSnapshotRequestId] = useState(0);
  const [isClosetSidebarOpen, setIsClosetSidebarOpen] = useState(false);
  const {
    canvasItems,
    selectedItemId,
    setSelectedItemId,
    addClosetItemToCanvas,
    updateCanvasItem,
    removeCanvasItem,
    removeSelectedItem,
    clearCanvasItems,
    replaceCanvasItems,
    clearSelection,
  } = useOutfitCanvasState();

  const groupedCategories = useMemo(
    () => groupClosetItemsByCategory(allClosetItems || []),
    [allClosetItems]
  );

  const categoryNames = useMemo(
    () => Object.keys(groupedCategories),
    [groupedCategories]
  );

  const metadataDefaults = useMemo(
    () => buildMetadataDefaults(initialOutfit),
    [initialOutfit]
  );

  useEffect(() => {
    if (!isEditMode || !initialOutfit?.id) {
      return;
    }

    if (hydratedOutfitIdRef.current === initialOutfit.id) {
      return;
    }

    replaceCanvasItems(buildCanvasItemsFromOutfit(initialOutfit));
    hydratedOutfitIdRef.current = initialOutfit.id;
    setCanvasSnapshot(initialOutfit.image_url || "");
    setSnapshotError("");
  }, [initialOutfit, isEditMode, replaceCanvasItems]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedItemId) return;

      const targetTagName = event.target?.tagName;
      const isEditableTarget =
        event.target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(targetTagName);

      if (isEditableTarget) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeSelectedItem();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [removeSelectedItem, selectedItemId]);

  const handleAddItem = useCallback(
    (closetItem, droppedPosition) => {
      if (
        canvasItems.some(
          (canvasItem) => canvasItem.closetItemId === closetItem?.id
        )
      ) {
        setCanvasError(
          `${closetItem?.name || "This item"} is already in the outfit.`
        );
        return;
      }

      setCanvasError("");
      addClosetItemToCanvas(closetItem, stageSize, droppedPosition);
    },
    [addClosetItemToCanvas, canvasItems, stageSize]
  );

  const handleDragItemStart = useCallback((event, closetItem) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "application/x-wearwise-closet-item",
      JSON.stringify(closetItem)
    );
  }, []);

  const handleOpenSaveModal = useCallback(() => {
    if (canvasItems.length === 0) return;
    setCanvasSnapshot(isEditMode ? initialOutfit?.image_url || "" : "");
    setSnapshotError("");
    setSnapshotRequestId((previous) => previous + 1);
    setIsSaveModalOpen(true);
  }, [canvasItems.length, initialOutfit?.image_url, isEditMode]);

  const handleClearCanvas = useCallback(() => {
    clearCanvasItems();
    setCanvasError("");
    setCanvasSnapshot("");
    setSnapshotError("");
    setIsSaveModalOpen(false);
  }, [clearCanvasItems]);

  const isSaving =
    createOutfitMutation.isPending ||
    updateOutfitMutation.isPending ||
    uploadOutfitImageMutation.isPending;

  const handleSubmitOutfit = useCallback(
    async (formValues) => {
      const { apiPayload } = buildOutfitSavePayload(formValues, canvasItems);
      let savedOutfitId = initialOutfit?.id;

      try {
        if (isEditMode && initialOutfit?.id) {
          await updateOutfitMutation.mutateAsync({
            outfitId: initialOutfit.id,
            payload: apiPayload,
          });
        } else {
          const createdOutfit = await createOutfitMutation.mutateAsync(
            apiPayload
          );
          savedOutfitId = createdOutfit.id;
        }

        if (canvasSnapshot && savedOutfitId) {
          const snapshotFile = dataUrlToFile(
            canvasSnapshot,
            buildOutfitSnapshotFilename(formValues.name)
          );

          if (snapshotFile) {
            const formData = new FormData();
            formData.append("file", snapshotFile);
            await uploadOutfitImageMutation.mutateAsync({
              outfitId: savedOutfitId,
              formData,
            });
          }
        }

        showSuccessToast(
          isEditMode
            ? "Outfit updated successfully."
            : "Outfit saved successfully."
        );
      } catch (error) {
        throw new Error(
          error?.response?.data?.detail ||
            error?.message ||
            `Could not ${isEditMode ? "update" : "save"} the outfit.`
        );
      }
    },
    [
      canvasItems,
      canvasSnapshot,
      createOutfitMutation,
      initialOutfit?.id,
      isEditMode,
      updateOutfitMutation,
      uploadOutfitImageMutation,
    ]
  );

  if (isClosetLoading || isInitialLoading) {
    return <OutfitBuilderWorkspaceSkeleton />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {isEditMode ? "Edit Outfit Canvas" : "Make an Outfit"}
          </h1>
        </header>

        <div className={styles.builderLayout}>
          <div className={styles.sidebarPane}>
            <ClosetSidebar
              categoryNames={categoryNames}
              categoriesByName={groupedCategories}
              onAddItem={handleAddItem}
              onDragItemStart={handleDragItemStart}
              open={isClosetSidebarOpen}
              onClose={() => setIsClosetSidebarOpen(false)}
            />
          </div>

          <div className={styles.stagePane}>
            <div className={styles.mobileClosetBar}>
              <Button
                type="button"
                variant="tertiary"
                size="md"
                className={styles.mobileClosetButton}
                onClick={() => setIsClosetSidebarOpen(true)}
              >
                <span
                  className={`material-symbols-outlined ${styles.mobileClosetIcon}`}
                  aria-hidden="true"
                >
                  dresser
                </span>
                Open closet
              </Button>
            </div>

            <OutfitActionsBar
              totalItems={canvasItems.length}
              isSaving={isSaving}
              onSave={handleOpenSaveModal}
              onClearCanvas={handleClearCanvas}
              errorMessage={canvasError}
              saveLabel={isEditMode ? "Update Outfit" : "Save Outfit"}
              clearLabel={isEditMode ? "Clear Canvas" : "Refresh"}
            />

            <OutfitCanvas
              canvasItems={canvasItems}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              onClearSelection={clearSelection}
              onUpdateItem={updateCanvasItem}
              onRemoveItem={removeCanvasItem}
              onStageSizeChange={setStageSize}
              onDropItem={handleAddItem}
              snapshotRequestId={snapshotRequestId}
              onSnapshotReady={(snapshot) => {
                setCanvasSnapshot(snapshot);
                setSnapshotError(
                  snapshot
                    ? ""
                    : "Snapshot preview unavailable. This usually means the S3 image response is missing the CORS headers needed for canvas export."
                );
              }}
            />
          </div>
        </div>
      </div>

      <SaveOutfitModal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        canvasItems={canvasItems}
        canvasSnapshot={canvasSnapshot}
        snapshotError={snapshotError}
        onSubmit={handleSubmitOutfit}
        isSaving={isSaving}
        initialValues={metadataDefaults}
        title={isEditMode ? "Update Outfit Canvas" : "Save Outfit"}
        submitLabel={isEditMode ? "Update Outfit" : "Save Outfit"}
        onSuccess={
          isEditMode ? () => setIsSaveModalOpen(false) : handleClearCanvas
        }
      />
    </main>
  );
}
