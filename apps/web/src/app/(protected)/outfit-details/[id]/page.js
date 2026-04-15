"use client";

import { useParams } from "next/navigation";
import { useSingleOutfitQuery } from "../../../../features/outfits/hooks/useOutfitsQuery";
import OutfitDetails from "../../../../features/outfits/components/OutfitDetails";

const OutfitDetailsPage = () => {
  const params = useParams();
  const selectedOutfitId = params.id;
  const { data: singleOutfit } = useSingleOutfitQuery(selectedOutfitId);

  return <OutfitDetails outfit={singleOutfit} />;
};

export default OutfitDetailsPage;
