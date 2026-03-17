"use client";

import { useParams } from "next/navigation";
import { useSingleOutfitQuery } from "../../../../features/outfits/hooks/useOutfitsQuery";
import OutfitDetails from "../../../../features/outfits/components/OutfitDetails";

const OutfitDetailsPage = () => {
  // const { id: selectedOutfitId } = params;
  const params = useParams();
  const selectedOutfitId = params.id;
  const { data: singleOutfit } = useSingleOutfitQuery(selectedOutfitId);
  return (
    <main style={{ padding: 24 }}>
      <h1>Outfit Details</h1>
      <OutfitDetails outfit={singleOutfit} />
    </main>
  );
};

export default OutfitDetailsPage;
