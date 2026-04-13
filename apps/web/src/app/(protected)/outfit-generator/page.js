"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useClosetItemsQuery } from "@/features/closet/hooks/useClosetItemsQuery.js";
import { useCreateOutfitMutation } from "@/features/outfits/hooks/useCreateOutfitMutation.js";
import { useUploadOutfitImageMutation } from "@/features/outfits/hooks/useUploadOutfitImageMutation.js";
import SaveOutfitModal from "./components/SaveOutfitModal.jsx";
import ClosetSidebar from "./components/ClosetSidebar.jsx";
import OutfitActionsBar from "./components/OutfitActionsBar.jsx";
import { useOutfitCanvasState } from "./hooks/useOutfitCanvasState.js";
import {
  buildOutfitSavePayload,
  buildOutfitSnapshotFilename,
  dataUrlToFile,
} from "./utils/outfitCanvasUtils.js";
import { groupClosetItemsByCategory } from "@/app/components/closet/closetCategoryUtils.js";
import styles from "./page.module.scss";

const OutfitCanvas = dynamic(() => import("./components/OutfitCanvas.jsx"), {
  ssr: false,
});

export default function OutfitGeneratorPage() {
  const { data: allClosetItems, isLoading } = useClosetItemsQuery();
  const createOutfitMutation = useCreateOutfitMutation();
  const uploadOutfitImageMutation = useUploadOutfitImageMutation();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [canvasError, setCanvasError] = useState("");
  const [canvasSnapshot, setCanvasSnapshot] = useState("");
  const [snapshotError, setSnapshotError] = useState("");
  const [snapshotRequestId, setSnapshotRequestId] = useState(0);
  const {
    canvasItems,
    selectedItemId,
    setSelectedItemId,
    addClosetItemToCanvas,
    updateCanvasItem,
    removeCanvasItem,
    removeSelectedItem,
    clearCanvasItems,
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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
    setCanvasSnapshot("");
    setSnapshotError("");
    setSnapshotRequestId((previous) => previous + 1);
    setIsSaveModalOpen(true);
  }, [canvasItems.length]);

  const handleCloseSaveModal = useCallback(() => {
    setIsSaveModalOpen(false);
  }, []);

  const handleClearCanvas = useCallback(() => {
    clearCanvasItems();
    setCanvasError("");
    setCanvasSnapshot("");
    setSnapshotError("");
    setIsSaveModalOpen(false);
  }, [clearCanvasItems]);

  const handleSubmitOutfit = useCallback(
    async (formValues) => {
      const { apiPayload, builderSnapshot } = buildOutfitSavePayload(
        formValues,
        canvasItems
      );

      builderSnapshot.canvas = {
        width: stageSize.width || null,
        height: stageSize.height || null,
      };

      console.log({ apiPayload, builderSnapshot });

      // try {
      //   const createdOutfit = await createOutfitMutation.mutateAsync(
      //     apiPayload
      //   );

      //   if (canvasSnapshot) {
      //     const snapshotFile = dataUrlToFile(
      //       canvasSnapshot,
      //       buildOutfitSnapshotFilename(formValues.name)
      //     );

      //     if (snapshotFile) {
      //       const formData = new FormData();
      //       formData.append("file", snapshotFile);

      //       try {
      //         await uploadOutfitImageMutation.mutateAsync({
      //           outfitId: createdOutfit.id,
      //           formData,
      //         });
      //       } catch (uploadError) {
      //         console.error(
      //           "Outfit created, but snapshot upload failed:",
      //           uploadError
      //         );
      //       }
      //     }
      //   }
      // } catch (error) {
      //   throw new Error(
      //     error?.response?.data?.detail ||
      //       error?.message ||
      //       "Could not save the outfit."
      //   );
      // }
    },
    [
      canvasItems,
      canvasSnapshot,
      createOutfitMutation,
      stageSize.height,
      stageSize.width,
      uploadOutfitImageMutation,
    ]
  );

  if (isLoading) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>Make an Outfit</h1>
        </header>

        <div className={styles.builderLayout}>
          <div className={styles.sidebarPane}>
            <ClosetSidebar
              categoryNames={categoryNames}
              categoriesByName={groupedCategories}
              onAddItem={handleAddItem}
              onDragItemStart={handleDragItemStart}
            />
          </div>

          <div className={styles.stagePane}>
            <OutfitActionsBar
              totalItems={canvasItems.length}
              isSaving={
                createOutfitMutation.isPending ||
                uploadOutfitImageMutation.isPending
              }
              onSave={handleOpenSaveModal}
              onClearCanvas={handleClearCanvas}
              errorMessage={canvasError}
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
        onClose={handleCloseSaveModal}
        canvasItems={canvasItems}
        canvasSnapshot={canvasSnapshot}
        snapshotError={snapshotError}
        onSubmit={handleSubmitOutfit}
        isSaving={
          createOutfitMutation.isPending || uploadOutfitImageMutation.isPending
        }
      />
    </main>
  );
}
