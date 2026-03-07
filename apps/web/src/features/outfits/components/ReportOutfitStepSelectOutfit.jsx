"use client";

import { useEffect } from "react";
import styles from "./ReportOutfitModal.module.scss";
import Button from "../../../app/components/ui/Button";

export default function ReportOutfitStepSelectOutfit({
  selectedSource,
  setSelectedSource,
  selectedOutfitId,
  setSelectedOutfitId,
  outfitOptionsData,
}) {
  const currentList = outfitOptionsData[selectedSource] || [];
  const selectedOutfit =
    currentList.find((item) => item.id === selectedOutfitId) || null;

  useEffect(() => {
    setSelectedOutfitId(null);
  }, [selectedSource, setSelectedOutfitId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-6">
        <Button
          type="button"
          onClick={() => setSelectedSource("closet")}
          // className={`${styles.optionButton} ${
          //   selectedSource === "closet" ? styles.optionButtonActive : ""
          // }`}
          variant="secondary"
          size="lg"
        >
          From your closet
        </Button>

        <Button
          type="button"
          onClick={() => setSelectedSource("saved")}
          // className={`${styles.optionButton} ${
          //   selectedSource === "saved" ? styles.optionButtonActive : ""
          // }`}
          variant="secondary"
          size="lg"
        >
          From saved outfits
        </Button>

        <Button
          type="button"
          onClick={() => setSelectedSource("ai")}
          // className={`${styles.optionButton} ${
          //   selectedSource === "ai" ? styles.optionButtonActive : ""
          // }`}
          variant="secondary"
          size="lg"
        >
          AI generator outfits
        </Button>
      </div>

      <div className={styles.selectionBox}>
        <div className="flex gap-8">
          <div className={styles.previewCard}>
            <div className={styles.previewImage} />
          </div>

          <div className={styles.itemsWrap}>
            <div className="flex items-start justify-between gap-4">
              <button type="button">{"<"}</button>

              <div className="flex flex-1 items-start justify-center gap-4">
                {currentList.map((outfit) => (
                  <button
                    key={outfit.id}
                    type="button"
                    onClick={() => setSelectedOutfitId(outfit.id)}
                    className={`${styles.outfitItemCard} ${
                      selectedOutfitId === outfit.id ? styles.selectedCard : ""
                    }`}
                  >
                    <div className={styles.outfitItemBox} />
                    <div className={styles.outfitItemName}>
                      {outfit.items[0]}
                    </div>
                    <div className={styles.outfitItemSub}>Category</div>
                  </button>
                ))}
              </div>

              <button type="button">{">"}</button>
            </div>

            {selectedOutfit ? (
              <ul className={styles.detailList}>
                <li className={styles.detailText}>
                  Occasion: {selectedOutfit.occasion}
                </li>
                <li className={styles.detailText}>
                  Season: {selectedOutfit.season}
                </li>
                <li className={styles.detailText}>
                  Last time wore: {selectedOutfit.lastWorn}
                </li>
              </ul>
            ) : (
              <div className="mt-6 text-sm text-gray-500">
                Select one outfit to continue
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
