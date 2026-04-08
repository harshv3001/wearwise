"use client";

import { useRef, useState } from "react";

import { reverseGeocodeCurrentLocationApi } from "../api/locationApi";

function mapGeolocationError(error) {
  if (!error) {
    return "We couldn't access your location right now.";
  }

  switch (error.code) {
    case 1:
      return "Location permission was denied. Please allow access and try again.";
    case 2:
      return "Your current location couldn't be determined. Please try again.";
    case 3:
      return "Location request timed out. Please try again.";
    default:
      return "We couldn't access your location right now.";
  }
}

function getCityFallback(result) {
  return (
    result.city ||
    result.locality ||
    result.localityInfo?.informative?.find((item) => item?.name)?.name ||
    result.localityInfo?.administrative?.find((item) => item?.order === 8)?.name ||
    ""
  );
}

function getStateCode(rawCode) {
  if (!rawCode || typeof rawCode !== "string") {
    return null;
  }

  const parts = rawCode.split("-");
  const code = parts[parts.length - 1]?.trim();
  return code || null;
}

function normalizeReverseGeocode(result, latitude, longitude) {
  const city = getCityFallback(result).trim();
  const state = (result.principalSubdivision || "").trim();
  const country = (result.countryName || "").trim();
  const countryCode = (result.countryCode || "").trim().toUpperCase();

  return {
    city,
    state,
    state_code: getStateCode(result.principalSubdivisionCode),
    country,
    country_code: countryCode,
    latitude,
    longitude,
    display_label: [city, state, country].filter(Boolean).join(", "),
  };
}

export function useCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const getCurrentLocation = async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      const message = "This browser doesn't support location access.";
      setError(message);
      throw new Error(message);
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError("");

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const latitude = Number(position.coords.latitude);
      const longitude = Number(position.coords.longitude);

      const result = await reverseGeocodeCurrentLocationApi({
        latitude,
        longitude,
        signal: abortRef.current.signal,
      });

      const normalized = normalizeReverseGeocode(result, latitude, longitude);
      if (!normalized.country) {
        throw new Error("We found coordinates but couldn't identify your country.");
      }

      if (!normalized.city) {
        normalized.city = "Current location";
        normalized.display_label = [normalized.state, normalized.country]
          .filter(Boolean)
          .join(", ");
      }

      return normalized;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw error;
      }

      const message =
        error?.code != null
          ? mapGeolocationError(error)
          : error?.message || "We couldn't use your current location.";

      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getCurrentLocation,
    isLoading,
    error,
    clearError: () => setError(""),
  };
}
