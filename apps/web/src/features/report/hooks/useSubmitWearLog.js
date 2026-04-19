"use client";

import { useCallback } from "react";
import { showErrorToast, showSuccessToast } from "../../../lib/toast";
import { useCreateReportMutation } from "./useCreateReportMutation";

export function useSubmitWearLog() {
  const createReportMutation = useCreateReportMutation();

  const submitWearLog = useCallback(
    async ({
      outfitId,
      selectedDate,
      successMessage = "Outfit reported successfully.",
      errorMessage = "Could not report this outfit.",
    }) => {
      const payload = {
        date_worn: selectedDate,
        outfit_id: outfitId,
      };

      try {
        const result = await createReportMutation.mutateAsync(payload);

        if (result?.wear_log_id) {
          showSuccessToast(successMessage);
        }

        return result;
      } catch (error) {
        const detail =
          error?.response?.data?.detail || error?.message || errorMessage;

        showErrorToast(detail);
        throw new Error(detail);
      }
    },
    [createReportMutation]
  );

  return {
    submitWearLog,
    isPending: createReportMutation.isPending,
  };
}
