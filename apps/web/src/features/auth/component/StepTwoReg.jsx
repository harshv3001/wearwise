"use client";

import { useCallback } from "react";
import Button from "../../../app/components/ui/Button/Button";
import LocationFields from "./LocationFields";
import PreferenceFields from "./PreferenceFields";

export default function StepTwoReg({
  form,
  errors,
  loading,
  handlePrevStep,
  setForm,
  setErrors,
}) {
  const handleLocationUpdate = useCallback(
    (updates) => {
      setForm((prev) => ({ ...prev, ...updates }));
    },
    [setForm]
  );

  const handleErrorsClear = useCallback(
    (fields) => {
      setErrors((prev) => ({
        ...prev,
        ...Object.fromEntries(fields.map((f) => [f, ""])),
      }));
    },
    [setErrors]
  );

  const handleToggle = useCallback(
    (key, value) => {
      setForm((prev) => {
        const current = prev[key] || [];
        return {
          ...prev,
          [key]: current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value],
        };
      });
    },
    [setForm]
  );

  return (
    <>
      <LocationFields
        values={form}
        onUpdate={handleLocationUpdate}
        onErrorsClear={handleErrorsClear}
        required={true}
        errors={errors}
      />

      <PreferenceFields
        pref_styles={form.pref_styles}
        pref_colors={form.pref_colors}
        onToggle={handleToggle}
      />

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
          loading={loading}
          loadingText="Creating account..."
        >
          <span className="flex items-center gap-2">
            <span>Get Started</span>
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
