"use client";

import { useParams } from "next/navigation";
import { useClosetSingleItemQuery } from "../../../../features/closet/hooks/useClosetItemsQuery";
import ClosetDetails from "@/features/closet/component/ClosetDetails/ClosetDetails";

const ClosetDetailsPage = () => {
  const params = useParams();
  const selectedItemId = params?.itemId;
  const { data: singleItem } = useClosetSingleItemQuery(selectedItemId);

  return (
    <main style={{ padding: 24 }}>
      {singleItem ? <ClosetDetails item={singleItem} /> : <p>Loading...</p>}
    </main>
  );
};

export default ClosetDetailsPage;
