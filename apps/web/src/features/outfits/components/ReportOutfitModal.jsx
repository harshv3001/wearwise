"use client";

import { useState } from "react";

import Modal from "../../../app/components/ui/Modal/Modal";
import styles from "./ReportOutfitModal.module.scss";
import ReportOutfitStepDate from "./ReportOutfitStepDate";
import ReportOutfitStepSelectOutfit from "./ReportOutfitStepSelectOutfit";
import Button from "../../../app/components/ui/Button";

export default function ReportOutfitModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const isStepOneValid = !!selectedDate;

  step === 1 && !isStepOneValid;

  const modalClassName = step === 1 ? styles.modalSmall : styles.modalLarge;

  const handleClose = () => {
    setStep(1);
    setSelectedDate("");
    setIsSubmittingReport(false);
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
              selectedDate={selectedDate}
              onSuccess={handleClose}
              onPendingChange={setIsSubmittingReport}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {step > 1 ? (
              <Button
                onClick={handlePrev}
                variant="secondary"
                size="sm"
                disabled={isSubmittingReport}
              >
                Prev
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {step < 2 ? (
              <Button
                key="next-step-button"
                type="button"
                onClick={handleNext}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            ) : (
              <Button
                key="submit-report-button"
                type="submit"
                form="report-outfit-form"
                variant="primary"
                size="sm"
                loading={isSubmittingReport}
                loadingText="Reporting outfit..."
              >
                Report Outfit
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
