"use client";

import { useParams } from "next/navigation";
import { useClosetSingleItemQuery } from "../../../../features/closet/hooks/useClosetItemsQuery";

const ClosetDetailsPage = () => {
  // const { id: selectedOutfitId } = params;
  const params = useParams();
  const selectedItemId = params?.itemId;
  const { data: singleItem } = useClosetSingleItemQuery(selectedItemId);

  return (
    <main style={{ padding: 24 }}>
      <h1>Closet Details</h1>
      {/* <OutfitDetails outfit={singleOutfit} /> */}
    </main>
  );
};

export default ClosetDetailsPage;
