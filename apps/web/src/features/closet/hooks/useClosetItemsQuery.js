"use client";

import { useQuery } from "@tanstack/react-query";
import { getClosetItemsApi } from "../api/closetApi";

export function useClosetItemsQuery(category = "") {
  return useQuery({
    queryKey: ["closet-items", category],
    queryFn: () => getClosetItemsApi(category),
    staleTime: 1000 * 60 * 5,
  });
}
