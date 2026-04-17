"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { hasValidationErrors } from "../../../lib/helperFunctions";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";
import { useUpdateProfileMutation } from "../../../features/auth/hooks/useUpdateProfileMutation";
import AccountSecurityCard from "../../../features/auth/ProfilePage/AccountSecurityCard/AccountSecurityCard";
import AISettingsCard from "../../../features/auth/ProfilePage/AISettingsCard/AISettingsCard";
import BasicInfoCard from "../../../features/auth/ProfilePage/BasicInfoCard/BasicInfoCard";
import LocationCard from "../../../features/auth/ProfilePage/LocationCard/LocationCard";
import PreferencesCard from "../../../features/auth/ProfilePage/PreferencesCard/PreferencesCard";
import ProfileHero from "../../../features/auth/ProfilePage/ProfileHero/ProfileHero";
import ProfileNotice from "../../../features/auth/ProfilePage/ProfileNotice/ProfileNotice";
import StatsCard from "../../../features/auth/ProfilePage/StatsCard/StatsCard";
import {
  buildProfileFormData,
  buildProfileValidationErrors,
  computeProfileDiff,
  EMPTY_PROFILE_FORM,
  getUserLocationLabel,
  normalizeProfilePayload,
} from "../../../features/auth/ProfilePage/profileHelpers";
import styles from "./page.module.scss";
import {
  authIdentitiesQueryKey,
  getAuthIdentitiesApi,
} from "@/features/auth/api/authApi";
import { useQuery } from "@tanstack/react-query";
import { showErrorToast, showSuccessToast } from "../../../lib/toast";

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(EMPTY_PROFILE_FORM);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const updateProfileMutation = useUpdateProfileMutation();

  useEffect(() => {
    if (!user || isEditing) return;
    setFormData(buildProfileFormData(user));
  }, [user, isEditing]);

  const { data: identities, isPending: identitiesLoading } = useQuery({
    queryKey: authIdentitiesQueryKey,
    queryFn: getAuthIdentitiesApi,
  });

  const originalPayload = useMemo(
    () => normalizeProfilePayload(buildProfileFormData(user)),
    [user]
  );
  const currentPayload = useMemo(
    () => normalizeProfilePayload(formData),
    [formData]
  );
  const hasUnsavedChanges =
    isEditing &&
    JSON.stringify(currentPayload) !== JSON.stringify(originalPayload);

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSaveProfile = useCallback(async () => {
    const nextErrors = buildProfileValidationErrors(formData);
    setErrors(nextErrors);
    setSaveError("");

    if (
      hasValidationErrors(nextErrors, [
        "first_name",
        "last_name",
        "email",
        "username",
        "age",
      ])
    ) {
      return;
    }

    if (!hasUnsavedChanges) {
      setIsEditing(false);
      return;
    }

    try {
      const diffPayload = computeProfileDiff(originalPayload, currentPayload);
      await updateProfileMutation.mutateAsync(diffPayload);
      setIsEditing(false);
      showSuccessToast("Profile updated successfully.");
    } catch (error) {
      const detail =
        error?.response?.data?.detail ||
        "We couldn't save your changes. Please try again.";

      if (typeof detail === "string") {
        if (detail.toLowerCase().includes("username")) {
          setErrors((prev) => ({ ...prev, username: detail }));
        }
        if (detail.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: detail }));
        }
      }

      setSaveError(
        typeof detail === "string"
          ? detail
          : "We couldn't save your changes. Please try again."
      );
      showErrorToast(
        typeof detail === "string"
          ? detail
          : "We couldn't save your changes. Please try again."
      );
    }
  }, [
    currentPayload,
    formData,
    hasUnsavedChanges,
    updateProfileMutation,
    originalPayload,
  ]);

  const handleStartEditing = () => {
    setFormData(buildProfileFormData(user));
    setErrors({});
    setSaveError("");
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setFormData(buildProfileFormData(user));
    setErrors({});
    setSaveError("");
    setIsEditing(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSaveError("");
  };

  // Called by LocationCard when any location field changes (city search, geolocation, etc.)
  const handleLocationUpdate = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setSaveError("");
  };

  const handleToggleMultiValue = (key, value) => {
    setFormData((prev) => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
    setSaveError("");
  };

  const locationLabel = useMemo(() => getUserLocationLabel(user), [user]);

  const hasPassword = useMemo(
    () => Boolean(identities?.has_password),
    [identities]
  );

  return (
    <main className={styles.page}>
      {isLoading || identitiesLoading ? (
        <div className={styles.loadingState}>
          <p>Loading your profile...</p>
        </div>
      ) : (
        <div className={styles.shell}>
          <ProfileHero
            user={user}
            isEditing={isEditing}
            locationLabel={locationLabel}
            handleStartEditing={handleStartEditing}
            handleCancelEditing={handleCancelEditing}
            onSave={handleSaveProfile}
            isSaving={updateProfileMutation.isPending}
            hasPassword={hasPassword}
          />

          {saveError ? (
            <div className={styles.bannerError}>{saveError}</div>
          ) : null}

          <div>
            <ProfileNotice user={user} />
          </div>

          <div className={styles.grid}>
            <BasicInfoCard
              user={user}
              isEditing={isEditing}
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              hasPassword={hasPassword}
            />
            <AISettingsCard />
            <LocationCard
              user={user}
              isEditing={isEditing}
              formData={formData}
              onLocationUpdate={handleLocationUpdate}
            />
            <StatsCard />
            <PreferencesCard
              user={user}
              isEditing={isEditing}
              formData={formData}
              handleToggleMultiValue={handleToggleMultiValue}
            />
            <AccountSecurityCard hasPassword={hasPassword} />
          </div>
        </div>
      )}
    </main>
  );
}
