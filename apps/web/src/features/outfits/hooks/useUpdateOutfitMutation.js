"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOutfitApi } from "../api/outfitApi";

export function useUpdateOutfitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ outfitId, payload }) => updateOutfitApi(outfitId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      queryClient.invalidateQueries({
        queryKey: ["outfit", variables.outfitId],
      });
    },
  });
}
