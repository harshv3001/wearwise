import { useState } from "react";

import Input from "../../../app/components/ui/Input/Input";
import Button from "../../../app/components/ui/Button/Button";
import RadioGroup from "../../../app/components/ui/RadioGroup/RadioGroup";
import EyeToggleButton from "../../../app/components/ui/EyeToggleButton/EyeToggleButton";

import { GENDER_OPTIONS } from "../../../lib/static-data";

export default function StepOneReg({
  form,
  onChange,
  errors,
  loading,
  handleNextStep,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Input
          label="First Name"
          name="first_name"
          value={form.first_name}
          onChange={onChange}
          placeholder="Enter your first name"
          required
          autoComplete="given-name"
          error={errors.first_name}
        />

        <Input
          label="Last Name"
          name="last_name"
          value={form.last_name}
          onChange={onChange}
          placeholder="Enter your last name"
          required
          autoComplete="family-name"
          error={errors.last_name}
        />

        <Input
          label="Email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Enter your email"
          required
          autoComplete="email"
          error={errors.email}
        />

        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={onChange}
            placeholder="Enter your password"
            required
            autoComplete="new-password"
            error={errors.password}
          />
          <EyeToggleButton isVisible={showPassword} onClick={setShowPassword} />
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={onChange}
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          <EyeToggleButton
            isVisible={showConfirmPassword}
            onClick={setShowConfirmPassword}
          />
        </div>

        <Input
          label="Age"
          name="age"
          type="number"
          min="1"
          max="120"
          value={form.age}
          onChange={(e) => {
            const { value } = e.target;
            if (value === "" || (Number(value) >= 1 && Number(value) <= 120)) {
              onChange(e);
            }
          }}
          placeholder="Enter your age"
          required
          inputMode="numeric"
          error={errors.age}
        />
      </div>

      <div className="space-y-1">
        <RadioGroup
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={onChange}
          options={GENDER_OPTIONS}
          required
        />
        {errors.gender ? (
          <p className="text-xs text-red-500">{errors.gender}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          variant="secondary"
          type="button"
          onClick={handleNextStep}
          disabled={loading}
        >
          <span className="flex items-center gap-2">
            <span>Next Step</span>
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
