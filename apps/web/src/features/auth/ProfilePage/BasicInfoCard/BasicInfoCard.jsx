"use client";

import Input from "../../../../app/components/ui/Input/Input";
import RadioGroup from "../../../../app/components/ui/RadioGroup/RadioGroup";
import { GENDER_OPTIONS } from "../../../../lib/static-data";
import { getPlaceholderValue } from "../profileHelpers";
import FieldDisplay from "../FieldDisplay/FieldDisplay";
import SectionHeader from "../SectionHeader/SectionHeader";
import styles from "./BasicInfoCard.module.scss";

export default function BasicInfoCard({
  user,
  isEditing,
  formData,
  errors,
  handleInputChange,
  hasPassword,
}) {
  return (
    <section className={styles.card}>
      <SectionHeader
        title="Basic Info"
        description="Your core account details stay here."
      />

      {isEditing ? (
        <>
          <div className={styles.formGrid}>
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              error={errors.first_name}
              disabled={!hasPassword}
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              error={errors.last_name}
              disabled={!hasPassword}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              disabled={!hasPassword}
            />
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              error={errors.username}
            />

            <Input
              label="Age"
              name="age"
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => {
                const { value } = e.target;
                if (
                  value === "" ||
                  (Number(value) >= 1 && Number(value) <= 120)
                ) {
                  handleInputChange(e);
                }
              }}
              placeholder="Age"
              inputMode="numeric"
              error={errors.age}
            />
            <RadioGroup
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              options={GENDER_OPTIONS}
              className={styles.fullWidth}
              groupClassName={styles.genderOptions}
            />
          </div>
          <div className={styles.radioSection}></div>
        </>
      ) : (
        <div className={styles.formGrid}>
          <FieldDisplay label="First Name" value={user?.first_name} />
          <FieldDisplay label="Last Name" value={user?.last_name} />
          <FieldDisplay label="Email" value={user?.email} />
          <FieldDisplay
            label="Username"
            value={user?.username ? `@${user.username}` : ""}
          />
          <FieldDisplay
            label="Age"
            value={
              user?.age !== null && user?.age !== undefined
                ? String(user.age)
                : ""
            }
            placeholder="Not set"
          />
          <FieldDisplay
            label="Gender"
            value={getPlaceholderValue(user?.gender, "")}
            placeholder="Not chosen"
          />
        </div>
      )}
    </section>
  );
}
