import { useState, useEffect } from "react";

import Input from "../../../app/components/ui/Input/Input";
import Button from "../../../app/components/ui/Button";
import SelectInput from "../../../app/components/ui/SelectInput/SelectInput";
import Chip from "../../../app/components/ui/Chip/Chip";
import { STYLE_OPTIONS, COLOR_OPTIONS } from "../../../lib/static-data";

export default function StepTwoReg({
  form,
  onChange,
  errors,
  loading,
  handlePrevStep,
  setForm,
}) {
  const [countryOptions, setCountryOptions] = useState([]);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name"
        );
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected response:", data);
          return;
        }

        const options = data
          .map((country) => ({
            label: country.name.common,
            value: country.name.common,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setCountryOptions(options);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    }

    fetchCountries();
  }, []);

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

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SelectInput
          label="Country"
          name="country"
          value={form.country}
          onChange={onChange}
          options={countryOptions}
          placeholder="Select your country"
          required
          error={errors.country}
        />

        <Input
          label="State"
          name="state"
          value={form.state}
          onChange={onChange}
          placeholder="Enter your state"
          required
          error={errors.state}
        />

        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={onChange}
          placeholder="Enter your city"
          required
          error={errors.city}
        />
        <Button
          variant="tertiary"
          size="sm"
          className="w-full lg:w-50 sm:h-max sm:mt-7"
        >
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined">location_on</span>
            <span>Use my location</span>
          </span>
        </Button>
      </div>

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
          disabled={loading}
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
