"use client";

import Input from "../../../app/components/ui/Input/Input";
import SelectInput from "../../../app/components/ui/SelectInput/SelectInput";
import Button from "../../../app/components/ui/Button";
import Link from "next/link";
import styles from "./ReportOutfitModal.module.scss";

export default function ReportOutfitStepDetails({
  formData,
  onChange,
  errors,
  selectedDate,
}) {
  return (
    <>
      <div className="flex items-center justify-between mx-16">
        <div>
          <span className="font-bold">Date selected:</span> {selectedDate}
        </div>
        <Link href="/closet">
          <Button type="button" variant="primary" size="md">
            Generate outfit from your closet
          </Button>
        </Link>
      </div>

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
    </>
  );
}
