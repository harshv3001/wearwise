"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authIdentitiesQueryKey,
  changePasswordApi,
} from "../api/authApi";

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authIdentitiesQueryKey });
    },
  });
}
