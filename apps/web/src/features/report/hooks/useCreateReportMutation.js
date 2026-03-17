"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReportApi } from "../api/reportApi";

export function useCreateReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReportApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wear"] });
    },
  });
}
