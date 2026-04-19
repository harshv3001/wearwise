import { http } from "../../../lib/http";

export async function getDashboardSummaryApi() {
  const response = await http.get("/dashboard/summary");
  return response.data;
}
