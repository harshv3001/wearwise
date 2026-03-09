"use client";

import { useMemo } from "react";
import styles from "./ReportOutfitModal.module.scss";
import Button from "../../../app/components/ui/Button";
import OutfitItemsCarousel from "./OutfitItemsCarousel";
import Link from "next/link";
import { ClassNames } from "@emotion/react";

export default function ReportOutfitStepSelectOutfit({
  closetItems = [],
  outfits,
  selectedDate,
  setSelectedOutfitId,
  selectedOutfitId,
}) {
  const previewOutfits = useMemo(() => {
    return (outfits?.items || []).map((outfit) => ({
      id: outfit?.id,
      name: outfit?.name,
      occasion: outfit?.occasion,
      season: outfit?.season,
      items: closetItems
        .filter((closetItem) =>
          outfit?.preview_items.find(
            (previewItem) => previewItem?.closet_item_id === closetItem?.id
          )
        )
        .map((closetItem) => ({
          id: closetItem?.id,
          name: closetItem?.name,
          category: closetItem?.category,
        })),
    }));
  }, [outfits, closetItems]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mx-16">
        <div>
          <span className="font-bold">Date selected:</span> {selectedDate}
        </div>
        <Link href="/closet">
          <Button type="button" variant="primary" size="md">
            Generate outfit from your closet
          </Button>
        </Link>
      </div>

      <div className={styles.outfitsContainer}>
        <div className="font-bold text-center m-2 text-lg">
          Saved outfit list
        </div>
        {previewOutfits.map((outfit, outfitIndex) => (
          <div
            className={`${styles.outfitRow} ${
              selectedOutfitId === outfit.id ? styles.selectedOutfit : ""
            }`}
            key={`outfit-${outfitIndex}-${outfit?.id}`}
          >
            <div className={styles.outfitPreviewCard}>
              <img
                src="winter-outfit.png"
                alt={`outfit image-${outfitIndex}-${outfit?.id}}`}
                className={styles.outfitPreviewImage}
              />
            </div>

            <div
              className={`${styles.outfitPreviewDetails} ${
                selectedOutfitId === outfit?.id ? styles.selectedOutfit : ""
              }`}
            >
              <OutfitItemsCarousel items={outfit?.items || []} />
              <div className="flex justify-between items-center">
                <ul className={styles.detailList}>
                  <li className={styles.detailText}>
                    <span>Occasion: </span>
                    {outfit?.occasion}
                  </li>
                  <li className={styles.detailText}>
                    <span> Season: </span>
                    {outfit?.season}
                  </li>
                  <li className={styles.detailText}>
                    <span> Last time wore: </span>
                    02/08/2026
                  </li>
                </ul>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={() => setSelectedOutfitId(outfit?.id)}
                  >
                    Select this outfit
                  </Button>
                  <Button type="button" variant="tertiary">
                    View details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
