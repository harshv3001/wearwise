"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentWeatherApi } from "../api/weatherApi";

export function useWeather(latitude, longitude) {
  const hasCoordinates =
    typeof latitude === "number" && Number.isFinite(latitude) &&
    typeof longitude === "number" && Number.isFinite(longitude);

  return useQuery({
    queryKey: ["weather", latitude ?? null, longitude ?? null],
    queryFn: ({ signal }) =>
      getCurrentWeatherApi({
        latitude,
        longitude,
        signal,
      }),
    enabled: hasCoordinates,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
