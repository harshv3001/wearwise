"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOutfitApi } from "../api/outfitApi";

function mergeOutfitIntoListItem(previousItem, updatedOutfit) {
  const previewItems = Array.isArray(updatedOutfit.items)
    ? updatedOutfit.items.map((item) => ({
        id: item.closet_item?.id || item.closet_item_id,
        name: item.closet_item?.name || "",
        category: item.closet_item?.category || "Uncategorized",
        image_url: item.image_url || item.closet_item?.image_url || null,
      }))
    : previousItem?.preview_items ?? [];

  return {
    ...previousItem,
    ...updatedOutfit,
    item_count: previewItems.length,
    preview_items: previewItems,
  };
}

function updateDetailCache(previousOutfit, updatedOutfit) {
  if (
    !previousOutfit ||
    updatedOutfit?.items?.every((item) => Boolean(item?.closet_item))
  ) {
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
