"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClosetItemApi } from "../api/closetApi";

export function useCreateClosetItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClosetItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closet-items"] });
    },
  });
}
