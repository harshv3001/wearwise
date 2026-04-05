"use client";

import { useQuery } from "@tanstack/react-query";
import { searchCitiesApi, locationQueryKeys } from "../api/locationApi";
import { useDebouncedValue } from "./useDebouncedValue";

export function useCitySearch({
  query,
  country,
  state,
  countryCode,
  stateCode,
}) {
  const debouncedQuery = useDebouncedValue(query, 500);
  const enabled = Boolean(country) && debouncedQuery.trim().length >= 2;

  return useQuery({
    queryKey: locationQueryKeys.citySearch({
      query: debouncedQuery,
      country,
      state,
      countryCode,
      stateCode,
    }),
    queryFn: ({ signal }) =>
      searchCitiesApi({
        query: debouncedQuery,
        country,
        state,
        countryCode,
        stateCode,
        signal,
      }),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
