"use client";

import { useState } from "react";

import Modal from "../../../app/components/ui/Modal/Modal";
import styles from "./ReportOutfitModal.module.scss";
import ReportOutfitStepDate from "./ReportOutfitStepDate";
import ReportOutfitStepSelectOutfit from "./ReportOutfitStepSelectOutfit";
import Button from "../../../app/components/ui/Button";
import { useCreateReportMutation } from "../../report/hooks/useCreateReportMutation";
import { useOutfitsQuery } from "../hooks/useOutfitsQuery";
import { useClosetItemsQuery } from "../../closet/hooks/useClosetItemsQuery";

export default function ReportOutfitModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const createReportMutation = useCreateReportMutation();
  const { data: outfits, isLoading, error } = useOutfitsQuery({
    enabled: open,
  });

  const { data: closetItems } = useClosetItemsQuery("", {
    enabled: open,
  });

  const isStepOneValid = !!selectedDate;

  step === 1 && !isStepOneValid;

  const modalClassName = step === 1 ? styles.modalSmall : styles.modalLarge;

  const handleClose = () => {
    setStep(1);

    setSelectedOutfitId(null);
    onClose();
  };

  const handleNext = () => {
    if (step < 2) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (selectedOutfitId) {
      const selectedOutfit = outfits?.items?.find(
        (outfitItem) => outfitItem?.id === selectedOutfitId
      );

      const updatedSelectedOutfit = {
        ...selectedOutfit,
        items: selectedOutfit?.preview_items,
      };

      try {
        const payload = {
          date_worn: selectedDate,
          outfit: updatedSelectedOutfit,
        };

        const result = await createReportMutation.mutateAsync(payload);

        if (result.wear_log_id) {
          alert("Outfit reported successfully!");
          handleClose();
        }
      } catch (error) {
        console.error("report outfit failed:", error);
      }
    } else {
      alert("Please select an outfit to report");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className={`${styles.modalBase} ${modalClassName}`}
      title="Report Outfit"
    >
      <div className={styles.container}>
        <div className="flex items-center justify-center gap-2">
          <span
            className={`${styles.dot} ${step === 1 ? styles.dotActive : ""}`}
          />
          <span
            className={`${styles.dot} ${step === 2 ? styles.dotActive : ""}`}
          />
        </div>

        <div className={styles.content}>
          {step === 1 && (
            <ReportOutfitStepDate
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}

          {step === 2 && (
            <ReportOutfitStepSelectOutfit
              selectedOutfitId={selectedOutfitId}
              setSelectedOutfitId={setSelectedOutfitId}
              selectedDate={selectedDate}
              closetItems={closetItems}
              outfits={outfits}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {step > 1 ? (
              <Button onClick={handlePrev} variant="secondary" size="sm">
                Prev
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {step < 2 ? (
              <Button onClick={handleNext} variant="secondary" size="sm">
                Next
              </Button>
            ) : (
              <div className="flex gap-6">
                <Button onClick={handleSubmit} variant="primary" size="sm">
                  Report Outfit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
