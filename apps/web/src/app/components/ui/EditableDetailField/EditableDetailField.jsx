"use client";

import Input from "../Input/Input";
import SelectInput from "../SelectInput/SelectInput";
import RadioGroup from "../RadioGroup/RadioGroup";
import { formatDisplayValue } from "../../../../lib/helperFunctions";

export default function EditableDetailField({
  field,
  isEditing,
  value,
  onChange,
  className = "",
  displayInputClassName = "",
  editableInputClassName = "",
}) {
  const isReadOnlyInEdit = field.alwaysReadOnly === true;
  const canEditField = isEditing && !isReadOnlyInEdit;

  if (canEditField && field.type === "select") {
    return (
      <SelectInput
        label={field.label}
        name={field.key}
        value={value}
        onChange={onChange}
        options={field.options}
        placeholder={`Select ${field.label.toLowerCase()}`}
        className={className}
        selectClassName={editableInputClassName}
      />
    );
  }

  if (canEditField && field.type === "radio") {
    return (
      <RadioGroup
        label={field.label}
        name={field.key}
        value={String(value)}
        onChange={onChange}
        options={field.options || []}
        className={className}
      />
    );
  }

  const displayValue = canEditField
    ? value ?? ""
    : field.format
    ? field.format(value)
    : formatDisplayValue(value);

  return (
    <Input
      label={field.label}
      name={field.key}
      type={canEditField ? field.inputType || field.type || "text" : "text"}
      value={displayValue}
      onChange={onChange}
      readOnly={!canEditField}
      placeholder={field.placeholder || ""}
      className={className}
      inputClassName={
        canEditField ? editableInputClassName : displayInputClassName
      }
    />
  );
}
