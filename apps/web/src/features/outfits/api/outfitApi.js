import { http } from "../../../lib/http";

export async function getOutfitsApi() {
  const response = await http.get("/outfits/");
  return response.data;
}

export async function getOutfitByIdApi(outfitId) {
  const response = await http.get(`/outfits/${outfitId}`);
  return response.data;
}

export async function createOutfitApi(payload) {
  const response = await http.post("/outfits/", payload);
  return response.data;
}

export async function updateOutfitApi(outfitId, payload) {
  const response = await http.patch(`/outfits/${outfitId}`, payload);
  return response.data;
}

//TODO Delete
