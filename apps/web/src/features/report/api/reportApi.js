import { http } from "../../../lib/http";

export async function createReportApi(payload) {
  const response = await http.post("/wear", payload);
  return response.data;
}
