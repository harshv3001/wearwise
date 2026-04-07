"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../../app/components/ui/Button";
import Input from "../../../app/components/ui/Input/Input";
import SelectInput from "../../../app/components/ui/SelectInput/SelectInput";
import { useCountriesQuery } from "../hooks/useCountriesQuery";
import { useStatesQuery } from "../hooks/useStatesQuery";
import { useCitySearch } from "../hooks/useCitySearch";
import { useCurrentLocation } from "../hooks/useCurrentLocation";

function normalizeText(value) {
  return (value || "").trim().toLowerCase();
}

function findMatchingOption(options, code, name) {
  if (!code && !name) return null;
  if (code) {
    const byCode = options.find(
      (o) => o.code && o.code.toUpperCase() === code.toUpperCase()
    );
    if (byCode) return byCode;
  }
  return options.find((o) => normalizeText(o.value) === normalizeText(name)) || null;
}

/**
 * Shared location fields: country, state/province, city (with autocomplete),
 * and a "Use my location" button.
 *
 * Props:
 *   values          – current form values (country, country_code, state, state_code, city, latitude, longitude)
 *   onUpdate        – (updates: object) => void  — called with any field changes; may include
 *                     `state_required` and `selected_city` which callers can store or ignore
 *   onErrorsClear   – optional (fields: string[]) => void — called to clear validation errors
 *   required        – whether country/state/city are required fields (default false)
 *   errors          – optional { country, state, city } validation error strings
 */
export default function LocationFields({
  values,
  onUpdate,
  onErrorsClear,
  required = false,
  errors = {},
}) {
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stateRequired, setStateRequired] = useState(true);

  // Keep a stable ref to onUpdate so effects don't need it as a dep
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  const countriesQuery = useCountriesQuery();
  const statesQuery = useStatesQuery(values.country || null);
  const citySearchQuery = useCitySearch({
    query: values.city,
    country: values.country,
    state: values.state,
    countryCode: values.country_code,
    stateCode: values.state_code,
    enabled: isCityFocused,
  });
  const currentLocation = useCurrentLocation();

  const countryOptions = useMemo(
    () =>
      (countriesQuery.data || []).map((c) => ({
        label: c.name,
        value: c.name,
        code: c.code || "",
      })),
    [countriesQuery.data]
  );

  const stateOptions = useMemo(
    () =>
      (statesQuery.data || []).map((s) => ({
        label: s.name,
        value: s.name,
        code: s.code || "",
      })),
    [statesQuery.data]
  );

  const stateHasOptions = statesQuery.isSuccess && !statesQuery.isError && stateOptions.length > 0;

  // Sync stateRequired into parent form so registration can validate it
  useEffect(() => {
    if (!values.country || statesQuery.isLoading || statesQuery.isFetching) return;
    const next = !statesQuery.isError && stateOptions.length > 0;
    if (stateRequired === next) return;
    setStateRequired(next);
    onUpdateRef.current({ state_required: next });
  }, [
    values.country,
    statesQuery.isLoading,
    statesQuery.isFetching,
    statesQuery.isError,
    stateOptions.length,
    stateRequired,
  ]);

  // Normalize country name to match the loaded dropdown option
  // (needed when geolocation fires before countries have loaded)
  useEffect(() => {
    if (!countryOptions.length || !values.country_code) return;
    const matched = findMatchingOption(countryOptions, values.country_code, values.country);
    if (!matched || matched.value === values.country) return;
    onUpdateRef.current({
      country: matched.value,
      country_code: matched.code || values.country_code,
    });
  }, [countryOptions, values.country_code, values.country]);

  // Normalize state name to match the loaded dropdown option
  useEffect(() => {
    if (!stateOptions.length || !values.state) return;
    const matched = findMatchingOption(stateOptions, values.state_code, values.state);
    if (!matched) return;
    if (
      matched.value === values.state &&
      (matched.code || "") === (values.state_code || "")
    )
      return;
    onUpdateRef.current({
      state: matched.value,
      state_code: matched.code || values.state_code || "",
    });
  }, [stateOptions, values.state, values.state_code]);

  const shouldShowSuggestions =
    isCityFocused &&
    Boolean(values.country) &&
    (values.city || "").trim().length >= 2 &&
    !selectedCity;

  const citySuggestions = citySearchQuery.data || [];
  const showNoResults =
    shouldShowSuggestions &&
    !citySearchQuery.isLoading &&
    !citySearchQuery.isFetching &&
    citySuggestions.length === 0;

  const handleCountryChange = (e) => {
    const nextCountry = e.target.value;
    const selected = countryOptions.find((o) => o.value === nextCountry);
    setSelectedCity(null);
    setIsCityFocused(false);
    onUpdate({
      country: nextCountry,
      country_code: selected?.code || "",
      state: "",
      state_code: "",
      city: "",
      latitude: null,
      longitude: null,
      selected_city: null,
      state_required: true,
    });
    onErrorsClear?.(["country", "state", "city"]);
  };

  const handleStateChange = (e) => {
    const nextState = e.target.value;
    const selected = stateOptions.find((o) => o.value === nextState);
    setSelectedCity(null);
    onUpdate({
      state: nextState,
      state_code: selected?.code || "",
      city: "",
      latitude: null,
      longitude: null,
      selected_city: null,
    });
    onErrorsClear?.(["state", "city"]);
  };

  const handleCityInputChange = (e) => {
    setSelectedCity(null);
    onUpdate({
      city: e.target.value,
      latitude: null,
      longitude: null,
      selected_city: null,
    });
    onErrorsClear?.(["city"]);
  };

  const handleCitySelect = (suggestion) => {
    setSelectedCity(suggestion);
    setIsCityFocused(false);
    onUpdate({
      city: suggestion.city,
      state: suggestion.state || values.state,
      state_code: suggestion.state_code || values.state_code || "",
      country: suggestion.country || values.country,
      country_code: suggestion.country_code || values.country_code || "",
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      selected_city: suggestion,
    });
    onErrorsClear?.(["city", "state", "country"]);
  };

  const handleUseCurrentLocation = async () => {
    currentLocation.clearError();
    try {
      const location = await currentLocation.getCurrentLocation();
      const matchedCountry = findMatchingOption(
        countryOptions,
        location.country_code,
        location.country
      );
      const nextCountry = matchedCountry?.value || location.country;
      const nextCountryCode = matchedCountry?.code || location.country_code || "";
      const newSelectedCity = {
        city: location.city,
        state: location.state,
        state_code: location.state_code || "",
        country: nextCountry,
        country_code: nextCountryCode,
        latitude: location.latitude,
        longitude: location.longitude,
        display_label:
          location.display_label ||
          [location.city, location.state, nextCountry].filter(Boolean).join(", "),
      };
      setSelectedCity(newSelectedCity);
      setIsCityFocused(false);
      onUpdate({
        country: nextCountry,
        country_code: nextCountryCode,
        state: location.state,
        state_code: location.state_code || "",
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        selected_city: newSelectedCity,
      });
      onErrorsClear?.(["country", "state", "city"]);
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SelectInput
        label="Country"
        name="country"
        value={values.country}
        onChange={handleCountryChange}
        options={countryOptions}
        placeholder={
          countriesQuery.isLoading ? "Loading countries..." : "Select your country"
        }
        required={required}
        disabled={countriesQuery.isLoading || countriesQuery.isError}
        error={errors.country}
      />

      <SelectInput
        label="State / Province"
        name="state"
        value={values.state}
        onChange={handleStateChange}
        options={stateOptions}
        placeholder={
          !values.country
            ? "Select a country first"
            : statesQuery.isLoading
              ? "Loading states..."
              : stateHasOptions
                ? "Select your state"
                : "No states available"
        }
        required={required && stateHasOptions}
        disabled={!values.country || statesQuery.isLoading || !stateHasOptions}
        error={errors.state}
      />

      <div className="relative lg:col-span-2">
        <Input
          label="City"
          name="city"
          value={values.city}
          onChange={handleCityInputChange}
          onFocus={() => setIsCityFocused(true)}
          onBlur={() => window.setTimeout(() => setIsCityFocused(false), 120)}
          placeholder={values.country ? "Search for your city" : "Select a country first"}
          required={required}
          disabled={!values.country}
          error={errors.city}
          helperText={
            selectedCity
              ? `Selected: ${selectedCity.display_label}`
              : "Type at least 2 characters, then pick a city from the suggestions."
          }
          autoComplete="off"
        />

        {shouldShowSuggestions ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[var(--ww-border,#d7d7d7)] bg-white shadow-lg">
            {citySearchQuery.isLoading || citySearchQuery.isFetching ? (
              <div className="px-4 py-3 text-sm text-slate-600">
                Searching cities...
              </div>
            ) : null}

            {citySearchQuery.isError ? (
              <div className="px-4 py-3 text-sm text-red-500">
                Couldn&apos;t load city suggestions. Try again in a moment.
              </div>
            ) : null}

            {showNoResults ? (
              <div className="px-4 py-3 text-sm text-slate-600">
                No matching cities found.
              </div>
            ) : null}

            {!citySearchQuery.isLoading &&
            !citySearchQuery.isFetching &&
            !citySearchQuery.isError &&
            citySuggestions.length > 0 ? (
              <ul className="max-h-64 overflow-y-auto py-1">
                {citySuggestions.map((suggestion) => (
                  <li
                    key={`${suggestion.display_label}-${suggestion.latitude}-${suggestion.longitude}`}
                  >
                    <button
                      type="button"
                      className="flex w-full items-start px-4 py-3 text-left text-sm hover:bg-slate-50"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleCitySelect(suggestion);
                      }}
                    >
                      {suggestion.display_label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="lg:col-span-2">
        <Button
          variant="tertiary"
          size="sm"
          type="button"
          disabled={currentLocation.isLoading}
          onClick={handleUseCurrentLocation}
        >
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined">location_on</span>
            <span>
              {currentLocation.isLoading
                ? "Detecting location..."
                : "Use my location"}
            </span>
          </span>
        </Button>
      </div>

      {countriesQuery.isError ? (
        <p className="lg:col-span-2 text-sm text-red-500">
          We couldn&apos;t load countries right now. Refresh and try again.
        </p>
      ) : null}

      {values.country && statesQuery.isError ? (
        <p className="lg:col-span-2 text-sm text-red-500">
          We couldn&apos;t load states for this country. You can still continue
          by choosing a city if state data is unavailable.
        </p>
      ) : null}

      {currentLocation.error ? (
        <p className="lg:col-span-2 text-sm text-red-500">
          {currentLocation.error}
        </p>
      ) : null}
    </div>
  );
}
