"use client";

import { useQuery } from "@tanstack/react-query";
import { getCountriesApi, locationQueryKeys } from "../api/locationApi";

export function useCountriesQuery() {
  return useQuery({
    queryKey: locationQueryKeys.countries,
    queryFn: getCountriesApi,
    staleTime: 1000 * 60 * 60 * 24,
  });
}
