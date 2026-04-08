"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  currentUserQueryKey,
  uploadProfileImageApi,
} from "../api/authApi";

export function useUploadProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfileImageApi,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(currentUserQueryKey, updatedUser);
    },
  });
}
