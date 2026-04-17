"use client";

import { useParams } from "next/navigation";
import OutfitBuilderWorkspace from "../../components/OutfitBuilderWorkspace.jsx";
import { useSingleOutfitQuery } from "@/features/outfits/hooks/useOutfitsQuery.js";

export default function EditOutfitCanvasPage() {
  const params = useParams();
  const outfitId = params.id;
  const { data: outfit, isLoading } = useSingleOutfitQuery(outfitId);

  return (
    <OutfitBuilderWorkspace
      mode="edit"
      initialOutfit={outfit}
      isInitialLoading={isLoading}
    />
  );
}
