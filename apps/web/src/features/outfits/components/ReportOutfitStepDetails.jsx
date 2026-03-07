"use client";

import Input from "../../../app/components/ui/Input/Input";
import SelectInput from "../../../app/components/ui/SelectInput/SelectInput";

export default function ReportOutfitStepDetails({
  formData,
  onChange,
  errors,
}) {
  return (
    <div className="grid grid-cols-2 gap-x-16 gap-y-8">
      <Input
        type="text"
        label="Outfit Name"
        value={formData.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="Enter outfit name"
        required={true}
        error={errors.name}
      />
      <SelectInput
        label="Season"
        value={formData.season}
        onChange={(e) => onChange("season", e.target.value)}
        options={[
          { value: "spring", label: "Spring" },
          { value: "summer", label: "Summer" },
          { value: "fall", label: "Fall" },
          { value: "winter", label: "Winter" },
        ]}
        placeholder="Select season"
      />
      <Input
        type="text"
        label="Occasion"
        value={formData.occasion}
        onChange={(e) => onChange("occasion", e.target.value)}
        placeholder="Enter occasion (e.g. casual, formal)"
      />
      <Input
        type="textarea"
        label="Notes"
        value={formData.notes}
        onChange={(e) => onChange("notes", e.target.value)}
        placeholder="Additional notes about the outfit"
      />
    </div>
  );
}
