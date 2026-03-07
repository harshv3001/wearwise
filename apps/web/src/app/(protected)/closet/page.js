"use client";

import { useCreateClosetItemMutation } from "@/features/closet/hooks/useCreateClosetItemMutation";
import { useUpdateClosetItemMutation } from "@/features/closet/hooks/useUpdateClosetItemMutation";
import Button from "../../components/ui/Button";

export default function ClosetPage() {
  const createClosetItemMutation = useCreateClosetItemMutation();
  const updateClosetItemMutation = useUpdateClosetItemMutation();

  const handleCreate = async () => {
    try {
      const result = await createClosetItemMutation.mutateAsync({
        name: "stylish jacket",
        category: "jacket",
        color: "white",
        season: "summer",
        brand: "nike",
        price: 50,
        notes: "best jacket",
        store: "nike store",
        date_acquired: "2026-03-07",
      });

      console.log("created:", result);
    } catch (error) {
      console.error("create failed:", error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const result = await updateClosetItemMutation.mutateAsync({
        itemId: id,
        payload: {
          name: "my t-shirt changed",
          category: "t-shirt",
          color: "yellow",
          season: "all",
          brand: "nike",
          price: 150,
          notes: "notes",
          store: "nike",
          date_acquired: "2026-02-27",
          times_worn: 0,
        },
      });

      console.log("updated result", result);
    } catch (error) {
      console.log("updated failed", error);
    }
  };
  return (
    <main className="px-2">
      <h1>My Closet</h1>
      <div className="flex gap-6">
        <Button onClick={handleCreate} variant="secondary">
          Create an outfit
        </Button>
        <Button onClick={() => handleUpdate(1)} variant="secondary">
          Update an outfit (id:1)
        </Button>
      </div>
    </main>
  );
}
