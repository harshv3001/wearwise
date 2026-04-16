"use client";

import { useMemo, useState } from "react";
import styles from "./ReportOutfitModal.module.scss";
import Button from "../../../app/components/ui/Button";
import OutfitItemsCarousel from "./OutfitItemsCarousel";
import Link from "next/link";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback/ImageWithFallback";
import { useOutfitsQuery } from "../hooks/useOutfitsQuery";
import { useCreateReportMutation } from "../../report/hooks/useCreateReportMutation";

export default function ReportOutfitStepSelectOutfit({
  selectedDate,
  onSuccess,
}) {
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const createReportMutation = useCreateReportMutation();
  const { data: outfits, isLoading, error } = useOutfitsQuery();

  const previewOutfits = useMemo(() => {
    return (outfits?.items || []).map((outfit) => ({
      id: outfit?.id,
      name: outfit?.name,
      occasion: outfit?.occasion,
      season: outfit?.season,
      image_url: outfit?.image_url,
      items: outfit?.preview_items || [],
    }));
  }, [outfits]);

  const handleViewOutfitDetails = (outfitId) => {
    return `/outfit-details/${outfitId}`;
  };

  const handleSubmit = async () => {
    if (!selectedOutfitId) {
      alert("Please select an outfit to report");
      return;
    }

    const selectedOutfit = outfits?.items?.find(
      (outfitItem) => outfitItem?.id === selectedOutfitId
    );

    if (!selectedOutfit) {
      alert("Selected outfit could not be found");
      return;
    }

    const payload = {
      date_worn: selectedDate,
      outfit_id: selectedOutfit.id,
    };

    try {
      const result = await createReportMutation.mutateAsync(payload);

      if (result.wear_log_id) {
        alert("Outfit reported successfully!");
        onSuccess?.();
      }
    } catch (submitError) {
      console.error("report outfit failed:", submitError);
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading outfits...</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        Could not load saved outfits right now.
      </div>
    );
  }

  return (
    <form
      id="report-outfit-form"
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className="flex items-center justify-between mx-16">
        <div>
          <span className="font-bold">Date selected:</span> {selectedDate}
        </div>
        <Link href="/outfit-generator">
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
              <div className={styles.outfitPreviewImageFrame}>
                <ImageWithFallback
                  imageUrl={outfit?.image_url}
                  alt={outfit?.name}
                  fallbackText={outfit?.name}
                  className={styles.outfitPreviewImage}
                />
              </div>
              <div className="text-center">{outfit?.name}</div>
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

                  <Link
                    href={handleViewOutfitDetails(outfit.id)}
                    target="_blank"
                  >
                    <Button type="button" variant="primary" size="md">
                      View details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>
    </form>
  );
}
