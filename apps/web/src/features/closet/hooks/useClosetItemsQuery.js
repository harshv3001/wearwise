"use client";

import { useQuery } from "@tanstack/react-query";
import { getClosetItemsApi, getClosetItemByIdApi } from "../api/closetApi";
import { closetQueryKeys } from "./closetQueryKeys";

export function useClosetItemsQuery(category = "") {
  return useQuery({
    queryKey: closetQueryKeys.list(category),
    queryFn: () => getClosetItemsApi(category),
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
