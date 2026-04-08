"use client";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import styles from "./RadioGroup.module.scss";

export default function CustomRadioGroup({
  label,
  name,
  value,
  onChange,
  options = [],
  row = true,
  required = false,
  className = "",
  groupClassName = "",
}) {
  return (
    <FormControl className={className}>
      {label && (
        <FormLabel id={`${name}-label`} className={styles.fieldLabel}>
          {label} {required ? "*" : ""}
        </FormLabel>
      )}
      <RadioGroup
        row={row}
        aria-labelledby={`${name}-label`}
        name={name}
        value={value}
        onChange={onChange}
        className={groupClassName}
      >
        {options.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            control={<Radio />}
            label={opt.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
