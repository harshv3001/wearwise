"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImageApi } from "../api/closetApi";

export function useUploadItemImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, formData }) => uploadImageApi(itemId, formData),

    onSuccess: (data, variables) => {
      // refresh item detail
      queryClient.invalidateQueries({
        queryKey: ["closet-item", variables.itemId],
      });

      // refresh list (so image shows there too)
      queryClient.invalidateQueries({
        queryKey: ["closet-items"],
      });
    },
  });
}
