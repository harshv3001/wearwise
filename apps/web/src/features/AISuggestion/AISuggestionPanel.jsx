"use client";

import { useState } from "react";
import { FloatingSidePanel } from "@/app/components/ui/overlays";
import { useWeather } from "@/features/weather/hooks/useWeather";
import AISuggestionCard from "./AISuggestionCard";

export default function AISuggestionPanel({
  latitude,
  longitude,
  isUserLoading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasRequestedWeather, setHasRequestedWeather] = useState(false);

  const hasCoordinates =
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude);

  const weatherQuery = useWeather(latitude, longitude, {
    enabled: hasRequestedWeather,
  });

  const handleToggle = () => {
    setIsOpen((current) => {
      const nextOpenState = !current;

      if (nextOpenState && !hasRequestedWeather) {
        setHasRequestedWeather(true);
      }

      return nextOpenState;
    });
  };

  return (
    <FloatingSidePanel
      open={isOpen}
      onToggle={handleToggle}
      onClose={() => setIsOpen(false)}
      triggerLabel="AI Suggestions"
    >
      <AISuggestionCard
        weather={weatherQuery.data}
        isWeatherLoading={
          isOpen &&
          !weatherQuery.data &&
          (isUserLoading || (hasCoordinates && weatherQuery.isLoading))
        }
        isWeatherError={weatherQuery.isError}
        onRefresh={hasCoordinates ? weatherQuery.refetch : undefined}
        isRefreshing={weatherQuery.isFetching && Boolean(weatherQuery.data)}
      />
    </FloatingSidePanel>
  );
}
