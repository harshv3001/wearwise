"use client";

import { useQuery } from "@tanstack/react-query";
import { getClosetItemsApi, getClosetItemByIdApi } from "../api/closetApi";

export function useClosetItemsQuery(category = "") {
  return useQuery({
    queryKey: ["closet-items", category],
    queryFn: () => getClosetItemsApi(category),
    staleTime: 1000 * 60 * 5,
  });
}

export function useClosetSingleItemQuery(itemId) {
  return useQuery({
    queryKey: ["closet-items", itemId],
    queryFn: () => getClosetItemByIdApi(itemId),
    staleTime: 1000 * 60 * 5,
  });
}
