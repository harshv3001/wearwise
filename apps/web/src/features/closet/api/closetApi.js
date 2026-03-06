import { http } from "../../../lib/http";

export async function getClosetItemsApi() {
  const res = await http.get("/closet-items");
  return res.data;
}

// #TODO: add create/update/delete APIs for closet items
// createClosetItemApi(payload)

// deleteClosetItemApi(id)