"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImageApi } from "../api/closetApi";
import { closetQueryKeys } from "./closetQueryKeys";

export function useUploadItemImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, formData }) => uploadImageApi(itemId, formData),

    onSuccess: (updatedItem, variables) => {
      queryClient.setQueryData(
        closetQueryKeys.detail(variables.itemId),
        updatedItem
      );

      const cachedClosetQueries = queryClient.getQueriesData({
        queryKey: closetQueryKeys.lists(),
      });

      cachedClosetQueries.forEach(([queryKey, cachedData]) => {
        if (!Array.isArray(cachedData)) {
          return;
        }

        queryClient.setQueryData(queryKey, (previousItems = []) =>
          previousItems.map((item) =>
            item.id === variables.itemId ? updatedItem : item
          )
        );
      });
    },
  });
}
