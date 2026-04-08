"use client";

import { useQuery } from "@tanstack/react-query";
import { getStatesApi, locationQueryKeys } from "../api/locationApi";

export function useStatesQuery(country) {
  return useQuery({
    queryKey: locationQueryKeys.states(country),
    queryFn: () => getStatesApi(country),
    enabled: Boolean(country),
    staleTime: 1000 * 60 * 60 * 24,
  });
}
