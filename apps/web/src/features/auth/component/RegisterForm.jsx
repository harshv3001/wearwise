"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Input from "../../../app/components/ui/Input/Input";
import Button from "../../../app/components/ui/Button";
import SelectInput from "../../../app/components/ui/SelectInput/SelectInput";
import RadioGroup from "../../../app/components/ui/RadioGroup/RadioGroup";
import Chip from "../../../app/components/ui/Chip/Chip";
import EyeToggleButton from "../../../app/components/ui/EyeToggleButton/EyeToggleButton";

const STYLE_OPTIONS = [
  { label: "Casual", value: "casual" },
  { label: "Sporty", value: "sporty" },
  { label: "Formal", value: "formal" },
  { label: "Streetwear", value: "streetwear" },
  { label: "Other", value: "other" },
];

const COLOR_OPTIONS = [
  {
    label: "Black",
    value: "black",
    selectedBg: "var(--ww-chip-black-bg)",
    selectedText: "var(--ww-chip-black-text)",
    selectedBorder: "var(--ww-chip-black-border)",
  },
  {
    label: "White",
    value: "white",
    selectedBg: "var(--ww-chip-white-bg)",
    selectedText: "var(--ww-chip-white-text)",
    selectedBorder: "var(--ww-chip-white-border)",
  },
  {
    label: "Red",
    value: "red",
    selectedBg: "var(--ww-chip-red-bg)",
    selectedText: "var(--ww-chip-red-text)",
    selectedBorder: "var(--ww-chip-red-border)",
  },
  {
    label: "Yellow",
    value: "yellow",
    selectedBg: "var(--ww-chip-yellow-bg)",
    selectedText: "var(--ww-chip-yellow-text)",
    selectedBorder: "var(--ww-chip-yellow-border)",
  },
  {
    label: "Green",
    value: "green",
    selectedBg: "var(--ww-chip-green-bg)",
    selectedText: "var(--ww-chip-green-text)",
    selectedBorder: "var(--ww-chip-green-border)",
  },
  {
    label: "Blue",
    value: "blue",
    selectedBg: "var(--ww-chip-blue-bg)",
    selectedText: "var(--ww-chip-blue-text)",
    selectedBorder: "var(--ww-chip-blue-border)",
  },
  {
    label: "Pink",
    value: "pink",
    selectedBg: "var(--ww-chip-pink-bg)",
    selectedText: "var(--ww-chip-pink-text)",
    selectedBorder: "var(--ww-chip-pink-border)",
  },
  {
    label: "Orange",
    value: "orange",
    selectedBg: "var(--ww-chip-orange-bg)",
    selectedText: "var(--ww-chip-orange-text)",
    selectedBorder: "var(--ww-chip-orange-border)",
  },
  {
    label: "Brown",
    value: "brown",
    selectedBg: "var(--ww-chip-brown-bg)",
    selectedText: "var(--ww-chip-brown-text)",
    selectedBorder: "var(--ww-chip-brown-border)",
  },
  {
    label: "Grey",
    value: "grey",
    selectedBg: "var(--ww-chip-grey-bg)",
    selectedText: "var(--ww-chip-grey-text)",
    selectedBorder: "var(--ww-chip-grey-border)",
  },
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
      const nextSelections = selections.includes(value)
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
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-lg">Step {step} of 2</p>

        <div className="flex items-center gap-3 pt-1">
          {[1, 2].map((item) => (
            <span
              key={item}
              className={[
                "h-5 w-5 rounded-full border border-[var(--ww-gray-dark)]",
                step === item ? "bg-[var(--ww-gray-dark)]" : "bg-transparent",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="text-3xl font-semibold">
          {step === 1 ? "Create Your Account" : "Personalize Your Closet"}
        </div>
        <p className="text-sm">
          {step === 1
            ? "Sign up to start personalizing your closet."
            : "Help us tailor outfit suggestions to your style and location."}
        </p>
      </div>

      {step === 1 ? (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
              <EyeToggleButton
                isVisible={showPassword}
                onClick={setShowPassword}
              />
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
      ) : (
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
      )}

      <p className="pt-2 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline font-bold">
          Login
        </Link>
      </p>
    </form>
  );
}
