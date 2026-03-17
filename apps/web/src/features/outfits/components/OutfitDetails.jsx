import styles from "./ReportOutfitModal.module.scss";

const OutfitDetails = ({ outfit }) => {
  return (
    <>
      {outfit && (
        <div className={styles.outfitsContainer}>
          <h2 className="text-2xl font-bold mb-4">{outfit.name}</h2>
          <div className={styles.outfitRow}>
            <div className={styles.outfitPreviewCard}>
              <img
                src="winter-outfit.png"
                alt={`outfit image-${outfit?.id}}`}
                className={styles.outfitPreviewImage}
              />
            </div>
          </div>

          <p className="mb-2">
            <strong>Season:</strong> {outfit.season}
          </p>
          <p className="mb-2">
            <strong>Occasion:</strong> {outfit.occasion}
          </p>
          <p className="mb-4">
            <strong>Notes:</strong> {outfit.notes || "-"}
          </p>

          <h3 className="text-xl font-semibold mb-3">Items in this outfit:</h3>
          <ul className="list-disc list-inside">
            {outfit.items.map((item, i) => (
              <li key={`item-${item.id}-${i}`} className="mb-1" outfitRow>
                <div className={styles.outfitPreviewCard}>
                  {item.closet_item?.name} ({item.closet_item?.category}) -{" "}
                  {item.closet_item?.color}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
export default OutfitDetails;

export const mockOutfit = {
  name: "big 2 layered outfit",
  occasion: "formal",
  season: "winter",
  is_favorite: false,
  notes: null,
  id: 10,
  created_at: "2026-03-09T19:48:46.614865Z",
  updated_at: null,
  items: [
    {
      closet_item_id: 3,
      position: 0,
      note: null,
      outfit_id: 10,
      closet_item: {
        name: "college shoes",
        category: "shoes",
        color: "brown",
        season: "all",
        brand: "woodland",
        price: 40,
        notes: "notes",
        store: "Amazon",
        date_acquired: "2026-03-03",
        id: 3,
        user_id: 1,
        times_worn: 3,
        created_at: "2026-03-03T05:14:56.218715Z",
        updated_at: "2026-03-09T19:48:46.614865Z",
      },
    },
    {
      closet_item_id: 5,
      position: 1,
      note: null,
      outfit_id: 10,
      closet_item: {
        name: "college jacket",
        category: "jacket",
        color: "blue",
        season: "fall",
        brand: "brand jacket",
        price: 30,
        notes: "notes",
        store: "cosco",
        date_acquired: "2026-03-03",
        id: 5,
        user_id: 1,
        times_worn: 3,
        created_at: "2026-03-03T05:16:52.217292Z",
        updated_at: "2026-03-09T19:48:46.614865Z",
      },
    },
    {
      closet_item_id: 1,
      position: 2,
      note: null,
      outfit_id: 10,
      closet_item: {
        name: "my t-shirt changed",
        category: "t-shirt",
        color: "yellow",
        season: "all",
        brand: "nike",
        price: 150,
        notes: "notes",
        store: "nike",
        date_acquired: "2026-02-27",
        id: 1,
        user_id: 1,
        times_worn: 3,
        created_at: "2026-02-27T23:51:37.435337Z",
        updated_at: "2026-03-09T19:48:46.614865Z",
      },
    },
    {
      closet_item_id: 8,
      position: 2,
      note: null,
      outfit_id: 10,
      closet_item: {
        name: "csummer shorts",
        category: "shorts",
        color: "black",
        season: "summer",
        brand: "nike",
        price: 10,
        notes: "comfy shorts",
        store: "nike store",
        date_acquired: "2026-03-03",
        id: 8,
        user_id: 1,
        times_worn: 4,
        created_at: "2026-03-03T06:32:57.824555Z",
        updated_at: "2026-03-09T19:48:46.614865Z",
      },
    },
    {
      closet_item_id: 2,
      position: 3,
      note: null,
      outfit_id: 10,
      closet_item: {
        name: "my jeans",
        category: "jeans",
        color: "blue",
        season: "all",
        brand: "levis",
        price: 40,
        notes: "notes",
        store: "cosco",
        date_acquired: "2026-02-27",
        id: 2,
        user_id: 1,
        times_worn: 3,
        created_at: "2026-02-27T23:52:21.775905Z",
        updated_at: "2026-03-09T19:48:46.614865Z",
      },
    },
    {
      closet_item_id: 9,
      position: 3,
      note: null,
      outfit_id: 10,
      closet_item: {
        name: "csummer white tshirt",
        category: "tshirt",
        color: "white",
        season: "summer",
        brand: "nike",
        price: 10,
        notes: "comfy tshirt",
        store: "nike store",
        date_acquired: "2026-03-03",
        id: 9,
        user_id: 1,
        times_worn: 4,
        created_at: "2026-03-03T06:37:04.020224Z",
        updated_at: "2026-03-09T19:48:46.614865Z",
      },
    },
    {
      closet_item_id: 10,
      position: 4,
      note: null,
      outfit_id: 10,
      closet_item: {
        name: "best sneakers",
        category: "shoes",
        color: "white",
        season: "summer",
        brand: "nike",
        price: 50,
        notes: "comfy sneakers",
        store: "nike store",
        date_acquired: "2026-03-03",
        id: 10,
        user_id: 1,
        times_worn: 4,
        created_at: "2026-03-03T06:38:02.252023Z",
        updated_at: "2026-03-09T19:48:46.614865Z",
      },
    },
  ],
};
