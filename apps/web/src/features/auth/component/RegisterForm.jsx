"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Chip from "@mui/material/Chip";
import Input from "../../../app/components/ui/Input/Input";
import Button from "../../../app/components/ui/Button";
import SelectInput from "../../../app/components/ui/SelectInput";
import RadioGroup from "../../../app/components/ui/RadioGroup/RadioGroup";

const STYLE_OPTIONS = ["casual", "sporty", "formal", "streetwear", "other"];

const COLOR_OPTIONS = [
  "black",
  "white",
  "red",
  "yellow",
  "green",
  "blue",
  "pink",
  "orange",
  "brown",
  "grey",
];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Woman", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

const INITIAL_ERRORS = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  age: "",
  gender: "",
  country: "",
  state: "",
  city: "",
};

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  age: "",
  gender: "",
  country: "",
  state: "",
  city: "",
  pref_styles: [],
  pref_colors: [],
};

export default function RegisterForm({ onSubmit, loading }) {
  const [countryOptions, setCountryOptions] = useState([]);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [form, setForm] = useState(INITIAL_FORM);

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

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "country" && { state: "", city: "" }),
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const toggleChip = (key, value) => {
    setForm((prev) => {
      const selections = prev[key] || [];
      const exists = selections.includes(value);
      const nextSelections = exists
        ? selections.filter((item) => item !== value)
        : [...selections, value];

      return {
        ...prev,
        [key]: nextSelections,
      };
    });
  };

  const getStepOneErrors = () => {
    const nextErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: "",
      gender: "",
    };

    if (!form.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!form.email) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Email is invalid";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 5) {
      nextErrors.password = "Password must be at least 5 characters";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.age) {
      nextErrors.age = "Age is required";
    } else if (Number(form.age) <= 0) {
      nextErrors.age = "Age must be greater than 0";
    }

    if (!form.gender) {
      nextErrors.gender = "Gender is required";
    }

    return nextErrors;
  };

  const getStepTwoErrors = () => {
    const nextErrors = {
      country: "",
      state: "",
      city: "",
    };

    if (!form.country) {
      nextErrors.country = "Country is required";
    }

    if (!form.state.trim()) {
      nextErrors.state = "State is required";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required";
    }

    return nextErrors;
  };

  const validateStepOne = () => {
    const nextErrors = getStepOneErrors();

    setErrors((prev) => ({
      ...prev,
      ...nextErrors,
    }));

    return ![
      "name",
      "email",
      "password",
      "confirmPassword",
      "age",
      "gender",
    ].some((key) => nextErrors[key]);
  };

  const validateStepTwo = () => {
    const nextErrors = getStepTwoErrors();

    setErrors((prev) => ({
      ...prev,
      ...nextErrors,
    }));

    return !["country", "state", "city"].some((key) => nextErrors[key]);
  };

  const validateAll = () => {
    const stepOneErrors = getStepOneErrors();
    const stepTwoErrors = getStepTwoErrors();

    setErrors({
      ...INITIAL_ERRORS,
      ...stepOneErrors,
      ...stepTwoErrors,
    });

    const stepOneValid = ![
      "name",
      "email",
      "password",
      "confirmPassword",
      "age",
      "gender",
    ].some((key) => stepOneErrors[key]);

    const stepTwoValid = !["country", "state", "city"].some(
      (key) => stepTwoErrors[key]
    );

    return stepOneValid && stepTwoValid;
  };

  const handleNextStep = () => {
    if (!validateStepOne()) return;
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    const { confirmPassword, ...payload } = form;

    onSubmit({
      ...payload,
      age: Number(payload.age || 0),
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <p className="text-sm opacity-70">Step {step} of 2</p>
        <h2 className="text-3xl font-semibold">
          {step === 1 ? "Create Your Account" : "Personalize Your Closet"}
        </h2>
        <p className="text-sm opacity-70">
          {step === 1
            ? "Sign up to start personalizing your closet."
            : "Help us tailor outfit suggestions to your style and location."}
        </p>
      </div>

      {step === 1 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Enter your name"
              required
              autoComplete="name"
              error={errors.name}
            />

            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@email.com"
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
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-[68%] -translate-y-[60%] rounded !bg-white p-1"
              >
                <img
                  src={
                    showPassword
                      ? "eye-password-hide.svg"
                      : "eye-password-show.svg"
                  }
                  alt="hide/show password"
                  className="w-5"
                />
              </button>
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
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-[68%] -translate-y-[60%] rounded !bg-white p-1"
              >
                <img
                  src={
                    showConfirmPassword
                      ? "eye-password-hide.svg"
                      : "eye-password-show.svg"
                  }
                  alt="hide/show confirm password"
                  className="w-5"
                />
              </button>
            </div>

            <Input
              label="Age"
              name="age"
              type="number"
              min="0"
              value={form.age}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) >= 0 || value === "") {
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

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              variant="secondary"
              type="button"
              onClick={handleNextStep}
              disabled={loading}
            >
              Next Step
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectInput
              label="Country"
              name="country"
              value={form.country}
              onChange={onChange}
              options={countryOptions}
              placeholder="Select country"
              required
              error={errors.country}
            />

            <Input
              label="State"
              name="state"
              value={form.state}
              onChange={onChange}
              placeholder="Enter your state/province"
              required
              error={errors.state}
            />

            <Input
              className="md:col-span-2"
              label="City"
              name="city"
              value={form.city}
              onChange={onChange}
              placeholder="Enter your city"
              required
              error={errors.city}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Preferred Styles</div>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((style) => (
                <Chip
                  className="p-6"
                  key={style}
                  label={style}
                  onClick={() => toggleChip("pref_styles", style)}
                  variant={
                    form.pref_styles.includes(style) ? "filled" : "outlined"
                  }
                  color={
                    form.pref_styles.includes(style) ? "primary" : "default"
                  }
                  clickable
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Preferred Colors</div>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <Chip
                  className="p-6"
                  key={color}
                  label={color}
                  onClick={() => toggleChip("pref_colors", color)}
                  variant={
                    form.pref_colors.includes(color) ? "filled" : "outlined"
                  }
                  color={
                    form.pref_colors.includes(color) ? "primary" : "default"
                  }
                  clickable
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              className="w-full sm:w-auto"
              variant="secondary"
              type="button"
              onClick={handlePrevStep}
              disabled={loading}
            >
              Prev Step
            </Button>

            <Button
              className="w-full sm:w-auto"
              variant="secondary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Get Started"}
            </Button>
          </div>
        </>
      )}

      <p className="text-sm opacity-70">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </form>
  );
}
