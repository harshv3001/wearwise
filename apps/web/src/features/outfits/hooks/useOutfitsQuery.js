"use client";

import { useQuery } from "@tanstack/react-query";
import { getOutfitsApi, getOutfitByIdApi } from "../api/outfitApi";

export function useOutfitsQuery(options = {}) {
  return useQuery({
    queryKey: ["outfits"],
    queryFn: getOutfitsApi,
    enabled: options.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSingleOutfitQuery(outfitId) {
  return useQuery({
    queryKey: ["outfit", outfitId],
    queryFn: () => getOutfitByIdApi(outfitId),
    enabled: !!outfitId,
    staleTime: 1000 * 60 * 5,
  });
}
