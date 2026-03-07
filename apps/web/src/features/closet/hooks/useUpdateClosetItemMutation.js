"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClosetItemApi } from "../api/closetApi";

export function useUpdateClosetItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, payload }) => updateClosetItemApi(itemId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["closet-items"] });
      queryClient.invalidateQueries({
        queryKey: ["closet-items", variables.itemId],
      });
    },
  });
}
