"use client";

import { useParams } from "next/navigation";
import { useClosetSingleItemQuery } from "../../../../features/closet/hooks/useClosetItemsQuery";

const ClosetDetailsPage = () => {
  // const { id: selectedOutfitId } = params;
  const params = useParams();
  console.log({ params });
  const selectedItemId = params?.itemId;
  console.log({ selectedItemId });
  const { data: singleItem } = useClosetSingleItemQuery(selectedItemId);
  console.log({ singleItem });
  return (
    <main style={{ padding: 24 }}>
      <h1>Closet Details</h1>
      {/* <OutfitDetails outfit={singleOutfit} /> */}
    </main>
  );
};

export default ClosetDetailsPage;
