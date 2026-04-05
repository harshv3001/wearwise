"use client";

import { useState } from "react";
import Link from "next/link";
import StepOneReg from "./StepOneReg";
import StepTwoReg from "./StepTwoReg";

const INITIAL_ERRORS = {
  first_name: "",
  last_name: "",
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
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirmPassword: "",
  age: "",
  gender: "",
  country: "",
  country_code: "",
  state: "",
  state_code: "",
  city: "",
  latitude: null,
  longitude: null,
  state_required: true,
  selected_city: null,
  pref_styles: [],
  pref_colors: [],
};

export default function RegisterForm({ onSubmit, loading }) {
  const [step, setStep] = useState(1);

  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [form, setForm] = useState(INITIAL_FORM);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const getStepOneErrors = () => {
    const nextErrors = {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: "",
      gender: "",
    };

    if (!form.first_name.trim()) {
      nextErrors.first_name = "First name is required";
    }

    if (!form.last_name.trim()) {
      nextErrors.last_name = "Last name is required";
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

    if (form.state_required && !form.state.trim()) {
      nextErrors.state = "State is required";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required";
    } else if (!form.selected_city) {
      nextErrors.city = "Select a city from the suggestions";
    } else if (
      typeof form.latitude !== "number" ||
      typeof form.longitude !== "number"
    ) {
      nextErrors.city = "Select a city with valid coordinates";
    }

    return nextErrors;
  };

  const handleNextStep = () => {
    const validateStepOne = () => {
      const nextErrors = getStepOneErrors();

      setErrors((prev) => ({
        ...prev,
        ...nextErrors,
      }));

      return ![
        "first_name",
        "last_name",
        "email",
        "password",
        "confirmPassword",
        "age",
        "gender",
      ].some((key) => nextErrors[key]);
    };

    if (!validateStepOne()) return;
    setStep(2);
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
      "first_name",
      "last_name",
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

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    const { confirmPassword, selected_city, state_required, ...payload } = form;

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
        <StepOneReg
          form={form}
          onChange={onChange}
          errors={errors}
          loading={loading}
          handleNextStep={handleNextStep}
        />
      ) : (
        <StepTwoReg
          form={form}
          errors={errors}
          loading={loading}
          setForm={setForm}
          setErrors={setErrors}
          handlePrevStep={handlePrevStep}
        />
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
