"use client";

import { useMemo, useState } from "react";
import Modal from "../../../app/components/ui/Modal/Modal";
import styles from "./ReportOutfitModal.module.scss";
import ReportOutfitStepDate from "./ReportOutfitStepDate";
import ReportOutfitStepSelectOutfit from "./ReportOutfitStepSelectOutfit";
import ReportOutfitStepDetails from "./ReportOutfitStepDetails";
import { outfitOptionsData } from "../../../lib/static-data";
import Button from "../../../app/components/ui/Button";

const initialFormData = {
  firstName: "",
  country: "",
  lastName: "",
  city: "",
};

export default function ReportOutfitModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSource, setSelectedSource] = useState("closet");
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const isStepOneValid = !!selectedDate;
  const isStepTwoValid = !!selectedSource && !!selectedOutfitId;

  const isNextDisabled =
    (step === 1 && !isStepOneValid) || (step === 2 && !isStepTwoValid);

  const modalClassName = step === 1 ? styles.modalSmall : styles.modalLarge;

  const selectedOutfit = useMemo(() => {
    const list = outfitOptionsData[selectedSource] || [];
    return list.find((item) => item.id === selectedOutfitId) || null;
  }, [selectedSource, selectedOutfitId]);

  const handleClose = () => {
    setStep(1);
    setSelectedDate("");
    setSelectedSource("closet");
    setSelectedOutfitId(null);
    setFormData(initialFormData);
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && !isStepOneValid) return;
    if (step === 2 && !isStepTwoValid) return;
    if (step < 3) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const payload = {
      date: selectedDate,
      source: selectedSource,
      outfitId: selectedOutfitId,
      outfit: selectedOutfit,
      formData,
    };

    console.log("Report outfit payload:", payload);
    handleClose();
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
          <span
            className={`${styles.dot} ${step === 3 ? styles.dotActive : ""}`}
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
              selectedSource={selectedSource}
              setSelectedSource={setSelectedSource}
              selectedOutfitId={selectedOutfitId}
              setSelectedOutfitId={setSelectedOutfitId}
              outfitOptionsData={outfitOptionsData}
            />
          )}

          {step === 3 && (
            <ReportOutfitStepDetails
              formData={formData}
              onChange={handleFormChange}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {step > 1 ? (
              <Button
                onClick={handlePrev}
                // className={styles.navButton}
                variant="tertiary"
                size="sm"
              >
                Prev
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={isNextDisabled}
                variant="tertiary"
                size="sm"
                // className={styles.navButton}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="sm"
                // className={styles.submitButton}
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
