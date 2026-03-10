"use client";

import { useState } from "react";

import Modal from "../../../app/components/ui/Modal/Modal";
import styles from "./ReportOutfitModal.module.scss";
import ReportOutfitStepDate from "./ReportOutfitStepDate";
import ReportOutfitStepSelectOutfit from "./ReportOutfitStepSelectOutfit";
import Button from "../../../app/components/ui/Button";
import { useCreateOutfitMutation } from "../hooks/useCreateOutfitMutation";
import { useUpdateOutfitMutation } from "../hooks/useUpdateOutfitMutation";
import { useCreateReportMutation } from "../../report/hooks/useCreateReportMutation";
import { useOutfitsQuery } from "../hooks/useOutfitsQuery";
import { useClosetItemsQuery } from "../../closet/hooks/useClosetItemsQuery";
import { useSingleOutfitQuery } from "../hooks/useOutfitsQuery";

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
  // const [selectedSource, setSelectedSource] = useState("closet");
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  // const [errors, setErrors] = useState({ name: false });
  const createOutfitMutation = useCreateOutfitMutation();
  const updateOutfitMutation = useUpdateOutfitMutation();
  const createReportMutation = useCreateReportMutation();
  // const { data: singleOutfit } = useSingleOutfitQuery(2);
  // console.log({ singleOutfit });
  const { data: outfits, isLoading, error } = useOutfitsQuery();

  const { data: closetItems } = useClosetItemsQuery("");

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

  // const handleUpdate = async (outfitId) => {
  //   try {
  //     const result = await updateOutfitMutation.mutateAsync({
  //       outfitId,
  //       payload: {
  //         name: "Updated Summer Outfit",
  //         notes: "Changed notes",
  //       },
  //     });

  //     console.log("outfit updated:", result);
  //   } catch (error) {
  //     console.error("update outfit failed:", error);
  //   }
  // };

  const handleSubmit = async () => {
    // if (formData.name.trim() === "") {
    //   setErrors({ name: true });
    //   return;
    // }

    // try {
    //   const result = await createOutfitMutation.mutateAsync({
    //     name: "Casual Summer Look",
    //     notes: "White tee with jeans",
    //     occasion: "casual",
    //     season: "summer",
    //     is_favorite: false,
    //     items: [
    //       { closet_item_id: 1, position: 1, note: "top" },
    //       { closet_item_id: 2, position: 2, note: "bottom" },
    //     ],
    //   });

    //   console.log("outfit created:", result);
    // } catch (error) {
    //   console.error("create outfit failed:", error);
    // }

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
        console.log("payload", payload);

        const result = await createReportMutation.mutateAsync(payload);
        console.log("outfit reported:", result);

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

  // const handleFormChange = (field, value) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  // };

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
              <Button
                onClick={handleNext}
                // disabled={isNextDisabled}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            ) : (
              <div className="flex gap-6">
                <Button onClick={handleSubmit} variant="primary" size="sm">
                  Report Outfit
                </Button>
                {/* <Button
                  onClick={() => handleUpdate(1)}
                  variant="primary"
                  size="sm"
                >
                  Change Outfit
                </Button> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
