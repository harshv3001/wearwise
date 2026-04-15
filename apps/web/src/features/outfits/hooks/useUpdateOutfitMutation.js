"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOutfitApi } from "../api/outfitApi";

function mergeOutfitIntoListItem(previousItem, updatedOutfit) {
  return {
    ...previousItem,
    ...updatedOutfit,
    item_count: previousItem?.item_count ?? updatedOutfit?.items?.length ?? 0,
    preview_items: previousItem?.preview_items ?? [],
  };
}

function updateDetailCache(previousOutfit, updatedOutfit) {
  if (!previousOutfit) {
    return updatedOutfit;
  }

  const updatedItemsByClosetItemId = new Map(
    (updatedOutfit.items || []).map((item) => [item.closet_item_id, item])
  );

  return {
    ...previousOutfit,
    ...updatedOutfit,
    // Keep the richer closet_item object from the detail query.
    items: (previousOutfit.items || []).map((item) => ({
      ...item,
      ...updatedItemsByClosetItemId.get(item.closet_item_id),
      closet_item: item.closet_item,
    })),
  };
}

export function useUpdateOutfitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ outfitId, payload }) => updateOutfitApi(outfitId, payload),
    onSuccess: (updatedOutfit, variables) => {
      queryClient.setQueryData(["outfit", variables.outfitId], (previousData) =>
        updateDetailCache(previousData, updatedOutfit)
      );

      const cachedOutfitQueries = queryClient.getQueriesData({
        queryKey: ["outfits"],
      });

      cachedOutfitQueries.forEach(([queryKey, cachedData]) => {
        if (!cachedData || !Array.isArray(cachedData.items)) {
          return;
        }

        queryClient.setQueryData(queryKey, (previousData) => {
          if (!previousData || !Array.isArray(previousData.items)) {
            return previousData;
          }

          return {
            ...previousData,
            items: previousData.items.map((outfit) =>
              outfit.id === variables.outfitId
                ? mergeOutfitIntoListItem(outfit, updatedOutfit)
                : outfit
            ),
          };
        });
      });
    },
  });
}
