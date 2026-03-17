"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOutfitApi } from "../api/outfitApi";

export function useCreateOutfitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOutfitApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });
}
