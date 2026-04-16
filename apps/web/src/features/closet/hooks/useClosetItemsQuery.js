"use client";

import { useQuery } from "@tanstack/react-query";
import { getClosetItemsApi, getClosetItemByIdApi } from "../api/closetApi";
import { closetQueryKeys } from "./closetQueryKeys";

export function useClosetItemsQuery(category = "", options = {}) {
  return useQuery({
    queryKey: closetQueryKeys.list(category),
    queryFn: () => getClosetItemsApi(category),
    enabled: options.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });
}

export function useClosetSingleItemQuery(itemId) {
  return useQuery({
    queryKey: closetQueryKeys.detail(itemId),
    queryFn: () => getClosetItemByIdApi(itemId),
    staleTime: 1000 * 60 * 5,
  });
}
