"use client";

import { useParams } from "next/navigation";
import { useSingleOutfitQuery } from "../../../../features/outfits/hooks/useOutfitsQuery";
import OutfitDetails from "../../../../features/outfits/components/OutfitDetails/OutfitDetails";
import OutfitDetailsSkeleton from "../../../../features/outfits/components/OutfitDetailsSkeleton/OutfitDetailsSkeleton";

const OutfitDetailsPage = () => {
  const params = useParams();
  const selectedOutfitId = params.id;
  const { data: singleOutfit, isLoading } = useSingleOutfitQuery(selectedOutfitId);

  if (isLoading) {
    return <OutfitDetailsSkeleton />;
  }

  return <OutfitDetails outfit={singleOutfit} />;
};

export default OutfitDetailsPage;
