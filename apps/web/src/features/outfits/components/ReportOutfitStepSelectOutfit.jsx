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
          variant="primary"
          size="md"
        >
          From your closet
        </Button>

        <Button
          type="button"
          onClick={() => setSelectedSource("saved")}
          variant="primary"
          size="md"
        >
          From saved outfits
        </Button>

        <Button
          type="button"
          onClick={() => setSelectedSource("ai")}
          variant="primary"
          size="md"
        >
          AI generator outfits
        </Button>
      </div>

      <div className={styles.outfitsContainer}>
        <div className="flex gap-x-16">
          <div className={styles.outfitPreviewCard}>
            <div className={styles.outfitPreviewImage} />
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

            <ul className={styles.detailList}>
              <li className={styles.detailText}>Occasion: Casual</li>
              <li className={styles.detailText}>Season: fall</li>
              <li className={styles.detailText}>Last time wore: 02/08/2026</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
