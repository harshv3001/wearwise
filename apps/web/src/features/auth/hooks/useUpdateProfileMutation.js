"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authIdentitiesQueryKey,
  currentUserQueryKey,
  updateCurrentUserApi,
} from "../api/authApi";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUserApi,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(currentUserQueryKey, updatedUser);
      queryClient.invalidateQueries({ queryKey: authIdentitiesQueryKey });
    },
  });
}
