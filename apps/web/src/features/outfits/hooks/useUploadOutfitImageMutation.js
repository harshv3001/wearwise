"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadOutfitImageApi } from "../api/outfitApi";

export function useUploadOutfitImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ outfitId, formData }) => uploadOutfitImageApi(outfitId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });
}
