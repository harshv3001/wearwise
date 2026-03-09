"use client";

import { useState, useEffect } from "react";
import Input from "../../../app/components/ui/Input/Input";
import Button from "../../../app/components/ui/Button";
import Chip from "@mui/material/Chip"; //"../../../app/components/ui/Chip";
import SelectInput from "../../../app/components/ui/SelectInput";
import RadioGroup from "../../../app/components/ui/RadioGroup";

const STYLE_OPTIONS = ["casual", "formal", "streetwear", "sportswear"];
const COLOR_OPTIONS = ["black", "white", "blue", "green", "brown", "red"];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export default function RegisterForm({ onSubmit, loading }) {
  const [countryOptions, setCountryOptions] = useState([]);
  //const [usStates, setUsStates] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name",
        );
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected response:", data);
          return;
        }

        const options = data
          .map((c) => ({
            label: c.name.common,
            value: c.name.common,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setCountryOptions(options);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    }
    fetchCountries();
  }, []);

  /*
  useEffect(() => {
    async function fetchStates() {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              country: "United States",
            }),
          },
        );

        const json = await res.json();

        const options = json.data.states.map((state) => ({
          label: state.name,
          value: state.name,
        }));

        setUsStates(options);
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    }

    fetchStates();
  }, []);
  */

  const initialForm = {
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    pref_styles: [],
    pref_colors: [],
  };

  const [form, setForm] = useState(initialForm);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "country" && { state: "" }),
    }));
  };

  const toggleChip = (key, value) => {
    setForm((prev) => {
      const arr = prev[key] || [];
      const exists = arr.includes(value);
      const nextArr = exists ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...prev, [key]: nextArr };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      age: Number(form.age || 0),
    });
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2">
          <Input
            className="col-span-1"
            label="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Enter your name"
            required
            autoComplete="name"
          />

          <Input
            className="col-span-1"
            label="Email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@email.com"
            required
            autoComplete="email"
          />

          <div className="relative">
            <Input
              className="col-span-1 pr-10"
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              placeholder="Enter your password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute !bg-white right-2 top-[68%] -translate-y-[60%] p-1 rounded"
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

          <Input
            className="col-span-1"
            label="Age"
            name="age"
            type="number"
            min="0"
            value={form.age}
            onChange={(e) => {
              const value = e.target.value;
              if (Number(value) >= 0 || value === "") {
                onChange(e); // only update if value is >= 0
              }
            }}
            placeholder="Enter your age"
            required
            inputMode="numeric"
          />
        </div>

        <RadioGroup
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={onChange}
          options={GENDER_OPTIONS}
          required
        />

        <SelectInput
          label="Country"
          name="country"
          value={form.country}
          onChange={onChange}
          options={countryOptions}
          placeholder="Select country"
          required
        />

        <Input
          label="State"
          name="state"
          value={form.state}
          onChange={onChange}
          placeholder="Enter your state/province"
          required
        />

        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={onChange}
          placeholder="Philadelphia"
          required
        />

        <div className="space-y-2">
          <div className="text-sm font-medium">Preferred Styles</div>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((s) => (
              <Chip
                key={s}
                label={s}
                onClick={() => toggleChip("pref_styles", s)}
                variant={form.pref_styles.includes(s) ? "filled" : "outlined"}
                color={form.pref_styles.includes(s) ? "primary" : "default"}
                clickable
              />
            ))}
          </div>
          <div className="text-xs opacity-70">
            Selected:{" "}
            {form.pref_styles.length ? form.pref_styles.join(", ") : "none"}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Preferred Colors</div>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <Chip
                key={c}
                label={c}
                onClick={() => toggleChip("pref_colors", c)}
                variant={form.pref_colors.includes(c) ? "filled" : "outlined"}
                color={form.pref_colors.includes(c) ? "primary" : "default"}
                clickable
              />
            ))}
          </div>
          <div className="text-xs opacity-70">
            Selected:{" "}
            {form.pref_colors.length ? form.pref_colors.join(", ") : "none"}
          </div>
        </div>
        <div className="pt-4 mt-4">
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </>
  );
}
