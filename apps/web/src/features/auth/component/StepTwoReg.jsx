"use client";

import { useEffect, useMemo, useState } from "react";

import Input from "../../../app/components/ui/Input/Input";
import Button from "../../../app/components/ui/Button";
import SelectInput from "../../../app/components/ui/SelectInput/SelectInput";
import Chip from "../../../app/components/ui/Chip/Chip";
import { STYLE_OPTIONS, COLOR_OPTIONS } from "../../../lib/static-data";
import { useCountriesQuery } from "../hooks/useCountriesQuery";
import { useStatesQuery } from "../hooks/useStatesQuery";
import { useCitySearch } from "../hooks/useCitySearch";
import { useCurrentLocation } from "../hooks/useCurrentLocation";

function normalizeText(value) {
  return (value || "").trim().toLowerCase();
}

function findMatchingCountryOption(options, location) {
  if (!location) {
    return null;
  }

  const byCode = options.find(
    (option) =>
      location.country_code &&
      option.code &&
      option.code.toUpperCase() === location.country_code.toUpperCase()
  );
  if (byCode) {
    return byCode;
  }

  return (
    options.find(
      (option) => normalizeText(option.value) === normalizeText(location.country)
    ) || null
  );
}

function findMatchingStateOption(options, location) {
  if (!location) {
    return null;
  }

  const byCode = options.find(
    (option) =>
      location.state_code &&
      option.code &&
      option.code.toUpperCase() === location.state_code.toUpperCase()
  );
  if (byCode) {
    return byCode;
  }

  return (
    options.find(
      (option) => normalizeText(option.value) === normalizeText(location.state)
    ) || null
  );
}

export default function StepTwoReg({
  form,
  errors,
  loading,
  handlePrevStep,
  setForm,
  setErrors,
}) {
  const [isCityFocused, setIsCityFocused] = useState(false);

  const countriesQuery = useCountriesQuery();
  const statesQuery = useStatesQuery(form.country);
  const currentLocation = useCurrentLocation();
  const citySearchQuery = useCitySearch({
    query: form.city,
    country: form.country,
    state: form.state,
    countryCode: form.country_code,
    stateCode: form.state_code,
  });

  const countryOptions = useMemo(
    () =>
      (countriesQuery.data || []).map((country) => ({
        label: country.name,
        value: country.name,
        code: country.code || "",
      })),
    [countriesQuery.data]
  );

  const stateOptions = useMemo(
    () =>
      (statesQuery.data || []).map((state) => ({
        label: state.name,
        value: state.name,
        code: state.code || "",
      })),
    [statesQuery.data]
  );

  const shouldShowSuggestions =
    isCityFocused &&
    Boolean(form.country) &&
    form.city.trim().length >= 2 &&
    !form.selected_city;

  const citySuggestions = citySearchQuery.data || [];
  const showNoResults =
    shouldShowSuggestions &&
    !citySearchQuery.isLoading &&
    !citySearchQuery.isFetching &&
    citySuggestions.length === 0;

  useEffect(() => {
    if (!form.country) {
      return;
    }

    if (statesQuery.isLoading || statesQuery.isFetching) {
      return;
    }

    const nextStateRequired = statesQuery.isError ? false : stateOptions.length > 0;
    if (form.state_required === nextStateRequired) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      state_required: nextStateRequired,
    }));
  }, [
    form.country,
    form.state_required,
    setForm,
    stateOptions.length,
    statesQuery.isError,
    statesQuery.isFetching,
    statesQuery.isLoading,
  ]);

  useEffect(() => {
    if (!countryOptions.length || !form.country_code) {
      return;
    }

    const matchedCountry = findMatchingCountryOption(countryOptions, form);
    if (!matchedCountry || matchedCountry.value === form.country) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      country: matchedCountry.value,
      country_code: matchedCountry.code || prev.country_code || "",
    }));
  }, [countryOptions, form, setForm]);

  useEffect(() => {
    if (!stateOptions.length || !form.state) {
      return;
    }

    const matchedState = findMatchingStateOption(stateOptions, form);
    if (!matchedState) {
      return;
    }

    if (
      matchedState.value === form.state &&
      (matchedState.code || "") === (form.state_code || "")
    ) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      state: matchedState.value,
      state_code: matchedState.code || prev.state_code || "",
    }));
  }, [form, setForm, stateOptions]);

  const toggleChip = (key, value) => {
    setForm((prev) => {
      const selections = prev[key] || [];
      const nextSelections = selections.includes(value)
        ? selections.filter((item) => item !== value)
        : [...selections, value];

      return {
        ...prev,
        [key]: nextSelections,
      };
    });
  };

  const handleCountryChange = (e) => {
    const nextCountry = e.target.value;
    const selectedCountry = countryOptions.find(
      (country) => country.value === nextCountry
    );

    setForm((prev) => ({
      ...prev,
      country: nextCountry,
      country_code: selectedCountry?.code || "",
      state: "",
      state_code: "",
      city: "",
      latitude: null,
      longitude: null,
      selected_city: null,
      state_required: true,
    }));

    setErrors((prev) => ({
      ...prev,
      country: "",
      state: "",
      city: "",
    }));

    setIsCityFocused(false);
  };

  const handleStateChange = (e) => {
    const nextState = e.target.value;
    const selectedState = stateOptions.find((state) => state.value === nextState);

    setForm((prev) => ({
      ...prev,
      state: nextState,
      state_code: selectedState?.code || "",
      city: "",
      latitude: null,
      longitude: null,
      selected_city: null,
    }));

    setErrors((prev) => ({
      ...prev,
      state: "",
      city: "",
    }));
  };

  const handleCityInputChange = (e) => {
    const nextCity = e.target.value;

    setForm((prev) => ({
      ...prev,
      city: nextCity,
      latitude: null,
      longitude: null,
      selected_city: null,
    }));

    setErrors((prev) => ({
      ...prev,
      city: "",
    }));
  };

  const handleCitySelect = (suggestion) => {
    setForm((prev) => ({
      ...prev,
      city: suggestion.city,
      state: suggestion.state || prev.state,
      state_code: suggestion.state_code || prev.state_code || "",
      country: suggestion.country || prev.country,
      country_code: suggestion.country_code || prev.country_code || "",
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      selected_city: suggestion,
    }));

    setErrors((prev) => ({
      ...prev,
      city: "",
      state: "",
      country: "",
    }));

    setIsCityFocused(false);
  };

  const handleUseCurrentLocation = async () => {
    currentLocation.clearError();

    try {
      const location = await currentLocation.getCurrentLocation();
      const matchedCountry = findMatchingCountryOption(countryOptions, location);
      const nextCountry = matchedCountry?.value || location.country;
      const nextCountryCode = matchedCountry?.code || location.country_code || "";

      setForm((prev) => ({
        ...prev,
        country: nextCountry,
        country_code: nextCountryCode,
        state: location.state,
        state_code: location.state_code || "",
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        selected_city: {
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
        },
      }));

      setErrors((prev) => ({
        ...prev,
        country: "",
        state: "",
        city: "",
      }));

      setIsCityFocused(false);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SelectInput
          label="Country"
          name="country"
          value={form.country}
          onChange={handleCountryChange}
          options={countryOptions}
          placeholder={
            countriesQuery.isLoading ? "Loading countries..." : "Select your country"
          }
          required
          disabled={countriesQuery.isLoading || countriesQuery.isError}
          error={errors.country}
        />

        <SelectInput
          label={form.state_required ? "State / Province" : "State / Province"}
          name="state"
          value={form.state}
          onChange={handleStateChange}
          options={stateOptions}
          placeholder={
            !form.country
              ? "Select a country first"
              : statesQuery.isLoading
                ? "Loading states..."
                : stateOptions.length > 0
                  ? "Select your state"
                  : "No states available"
          }
          required={form.state_required}
          disabled={!form.country || statesQuery.isLoading || stateOptions.length === 0}
          error={errors.state}
        />

        <div className="relative lg:col-span-2">
          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={handleCityInputChange}
            onFocus={() => setIsCityFocused(true)}
            onBlur={() => {
              window.setTimeout(() => {
                setIsCityFocused(false);
              }, 120);
            }}
            placeholder={
              form.country
                ? "Search for your city"
                : "Select a country first"
            }
            required
            disabled={!form.country}
            error={errors.city}
            helperText={
              form.selected_city
                ? `Selected: ${form.selected_city.display_label}`
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
                    <li key={`${suggestion.display_label}-${suggestion.latitude}-${suggestion.longitude}`}>
                      <button
                        type="button"
                        className="flex w-full items-start px-4 py-3 text-left text-sm hover:bg-slate-50"
                        onMouseDown={(event) => {
                          event.preventDefault();
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
            className="w-full lg:w-50 sm:h-max"
            disabled={loading || currentLocation.isLoading}
            onClick={handleUseCurrentLocation}
          >
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined">location_on</span>
              <span>
                {currentLocation.isLoading ? "Detecting location..." : "Use my location"}
              </span>
            </span>
          </Button>
        </div>
      </div>

      {countriesQuery.isError ? (
        <p className="text-sm text-red-500">
          We couldn&apos;t load countries right now. Refresh and try again.
        </p>
      ) : null}

      {form.country && statesQuery.isError ? (
        <p className="text-sm text-red-500">
          We couldn&apos;t load states for this country. You can still continue by
          choosing a city if state data is unavailable.
        </p>
      ) : null}

      {currentLocation.error ? (
        <p className="text-sm text-red-500">{currentLocation.error}</p>
      ) : null}

      <div className="space-y-3">
        <div className="text-sm font-medium">Main Style Preference</div>
        <div className="flex flex-wrap gap-3">
          {STYLE_OPTIONS.map((style) => (
            <Chip
              key={style.value}
              label={style.label}
              selected={form.pref_styles.includes(style.value)}
              selectedBg="var(--ww-gray-dark)"
              selectedBorder="var(--ww-gray-dark)"
              onClick={() => toggleChip("pref_styles", style.value)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Preferred Colors</div>
        <div className="flex flex-wrap gap-3">
          {COLOR_OPTIONS.map((color) => (
            <Chip
              key={color.value}
              label={color.label}
              selected={form.pref_colors.includes(color.value)}
              selectedBg={color.selectedBg}
              selectedText={color.selectedText}
              selectedBorder={color.selectedBorder}
              onClick={() => toggleChip("pref_colors", color.value)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          className="w-full sm:w-auto"
          variant="secondary"
          type="button"
          onClick={handlePrevStep}
          disabled={loading}
        >
          <span className="flex items-center gap-2">
            <span
              className="material-symbols-outlined leading-none"
              style={{ fontSize: "18px" }}
            >
              arrow_back
            </span>
            <span>Prev Step</span>
          </span>
        </Button>

        <Button
          className="w-full sm:w-auto"
          variant="primary"
          type="submit"
          disabled={
            loading ||
            countriesQuery.isLoading ||
            (Boolean(form.country) && (statesQuery.isLoading || statesQuery.isFetching))
          }
        >
          <span className="flex items-center gap-2">
            <span>{loading ? "Creating account..." : "Get Started"}</span>
            <span
              className="material-symbols-outlined leading-none"
              style={{ fontSize: "18px" }}
            >
              arrow_forward
            </span>
          </span>
        </Button>
      </div>
    </>
  );
}
