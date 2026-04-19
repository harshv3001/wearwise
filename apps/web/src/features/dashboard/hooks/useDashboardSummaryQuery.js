"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummaryApi } from "../api/dashboardApi";

export function useDashboardSummaryQuery(options = {}) {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummaryApi,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}
