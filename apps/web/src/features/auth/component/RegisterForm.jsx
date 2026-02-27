"use client";

import { useState } from "react";
import Input from "../../../app/components/ui/Input";
import Button from "../../../app/components/ui/Button";
import Chip from "../../../app/components/ui/Chip";
import SelectInput from "../../../app/components/ui/SelectInput";
import RadioGroup from "../../../app/components/ui/RadioGroup";

const STYLE_OPTIONS = ["casual", "formal", "streetwear", "sportswear"];
const COLOR_OPTIONS = ["black", "white", "blue", "green", "brown", "red"];

const COUNTRY_OPTIONS = [
  { label: "USA", value: "USA" },
  { label: "India", value: "India" },
];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export default function RegisterForm({ onSubmit, loading }) {
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
    setForm((prev) => ({ ...prev, [name]: value }));
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
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Name"
        name="name"
        value={form.name}
        onChange={onChange}
        placeholder="Your name"
        required
        autoComplete="name"
      />

      <Input
        label="Email"
        name="email"
        value={form.email}
        onChange={onChange}
        placeholder="you@email.com"
        required
        autoComplete="email"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        placeholder="••••••••"
        required
        autoComplete="new-password"
      />

      <Input
        label="Age"
        name="age"
        value={form.age}
        onChange={onChange}
        placeholder="26"
        required
        inputMode="numeric"
      />

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
        options={COUNTRY_OPTIONS}
        placeholder="Select country"
        required
      />

      <Input
        label="State"
        name="state"
        value={form.state}
        onChange={onChange}
        placeholder="Pennsylvania"
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
              selected={form.pref_styles.includes(s)}
              onClick={() => toggleChip("pref_styles", s)}
            />
          ))}
        </div>
        <div className="text-xs opacity-70">
          Selected: {form.pref_styles.length ? form.pref_styles.join(", ") : "none"}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Preferred Colors</div>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={form.pref_colors.includes(c)}
              onClick={() => toggleChip("pref_colors", c)}
            />
          ))}
        </div>
        <div className="text-xs opacity-70">
          Selected: {form.pref_colors.length ? form.pref_colors.join(", ") : "none"}
        </div>
      </div>

      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}