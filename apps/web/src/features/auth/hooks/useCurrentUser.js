"use client";

import { useQuery } from "@tanstack/react-query";
import { currentUserQueryKey, getCurrentUserApi } from "../api/authApi";
import { getToken } from "../../../lib/auth";

export function useCurrentUser() {
  const token = getToken();

  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUserApi,
    enabled: Boolean(token),
  });
}
