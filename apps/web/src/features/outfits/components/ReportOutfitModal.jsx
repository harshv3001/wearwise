"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOutfitsApi } from "../api/outfitApi";
import Modal from "../../../app/components/ui/Modal/Modal";
import styles from "./ReportOutfitModal.module.scss";
import ReportOutfitStepDate from "./ReportOutfitStepDate";
import ReportOutfitStepSelectOutfit from "./ReportOutfitStepSelectOutfit";
import ReportOutfitStepDetails from "./ReportOutfitStepDetails";
import { outfitOptionsData } from "../../../lib/static-data";
import Button from "../../../app/components/ui/Button";
import { useCreateOutfitMutation } from "../hooks/useCreateOutfitMutation";
import { useUpdateOutfitMutation } from "../hooks/useUpdateOutfitMutation";
import { useOutfitsQuery } from "../hooks/useOutfitsQuery";

const initialFormData = {
  name: "",
  occasion: "",
  season: "",
  notes: "",
  isFavorite: false,
};

export default function ReportOutfitModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [today, setToday] = useState(true);
  const [selectedSource, setSelectedSource] = useState("closet");
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({ name: false });

  const createOutfitMutation = useCreateOutfitMutation();
  const updateOutfitMutation = useUpdateOutfitMutation();

  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["outfits"],
  //   queryFn: getOutfitsApi,
  // });

  const { data: outfits, isLoading, error } = useOutfitsQuery();

  console.log("outfits", outfits);

  const isStepOneValid = !!selectedDate;
  const isStepTwoValid = !!selectedSource && !!selectedOutfitId;

  const isNextDisabled =
    (step === 1 && !isStepOneValid) || (step === 2 && !isStepTwoValid);

  const modalClassName = step === 1 ? styles.modalSmall : styles.modalLarge;

  const selectedOutfit = useMemo(() => {
    const list = outfitOptionsData[selectedSource] || [];
    return list.find((item) => item.id === selectedOutfitId) || null;
  }, [selectedSource, selectedOutfitId]);

  console.log("formData:", formData);

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

  const handleUpdate = async (outfitId) => {
    try {
      const result = await updateOutfitMutation.mutateAsync({
        outfitId,
        payload: {
          name: "Updated Summer Outfit",
          notes: "Changed notes",
        },
      });

      console.log("outfit updated:", result);
    } catch (error) {
      console.error("update outfit failed:", error);
    }
  };

  const handleSubmit = async () => {
    if (formData.name.trim() === "") {
      setErrors({ name: true });
      return;
    } else {
      try {
        const result = await createOutfitMutation.mutateAsync({
          name: "Casual Summer Look",
          notes: "White tee with jeans",
          occasion: "casual",
          season: "summer",
          is_favorite: false,
          items: [
            { closet_item_id: 1, position: 1, note: "top" },
            { closet_item_id: 2, position: 2, note: "bottom" },
          ],
        });

        console.log("outfit created:", result);
      } catch (error) {
        console.error("create outfit failed:", error);
      }

      const payload = {
        date: selectedDate,
        source: selectedSource,
        outfitId: selectedOutfitId,
        outfit: selectedOutfit,
        formData,
      };

      console.log("Report outfit payload:", payload);
      handleClose();
    }
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
              today={today}
              setToday={setToday}
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
              errors={errors}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {step > 1 ? (
              <Button onClick={handlePrev} variant="tertiary" size="sm">
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
              >
                Next
              </Button>
            ) : (
              <div className="flex gap-6">
                <Button onClick={handleSubmit} variant="primary" size="sm">
                  Report Outfit
                </Button>
                <Button
                  onClick={() => handleUpdate(1)}
                  variant="primary"
                  size="sm"
                >
                  Change Outfit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
