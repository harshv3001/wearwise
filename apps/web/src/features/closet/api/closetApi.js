import { http } from "../../../lib/http";

// export async function getClosetItemsApi() {
//   const res = await http.get("/closet-items");
//   return res.data;
// }

export async function getClosetItemsApi(category = "") {
  const url = category
    ? `/closet-items/?category=${encodeURIComponent(category)}`
    : `/closet-items/`;

  const response = await http.get(url);
  return response.data;
}

export async function getClosetItemByIdApi(itemId) {
  const response = await http.get(`/closet-items/${itemId}`);
  return response.data;
}

export async function createClosetItemApi(payload) {
  const response = await http.post("/closet-items/", payload);
  return response.data;
}

export async function updateClosetItemApi(itemId, payload) {
  const response = await http.put(`/closet-items/${itemId}`, payload);
  return response.data;
}

// #TODO: delete APIs for closet items
// deleteClosetItemApi(id)
