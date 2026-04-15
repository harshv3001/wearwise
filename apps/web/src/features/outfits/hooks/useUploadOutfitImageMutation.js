"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadOutfitImageApi } from "../api/outfitApi";

function mergeOutfitImageIntoListItem(previousItem, updatedOutfit) {
  return {
    ...previousItem,
    image_url: updatedOutfit.image_url,
    updated_at: updatedOutfit.updated_at,
  };
}

export function useUploadOutfitImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ outfitId, formData }) => uploadOutfitImageApi(outfitId, formData),
    onSuccess: (updatedOutfit, variables) => {
      queryClient.setQueryData(["outfit", variables.outfitId], updatedOutfit);

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
                ? mergeOutfitImageIntoListItem(outfit, updatedOutfit)
                : outfit
            ),
          };
        });
      });
    },
  });
}
