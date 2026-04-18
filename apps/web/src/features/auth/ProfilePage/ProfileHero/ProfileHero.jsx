"use client";

import { useCallback, useRef } from "react";
import Button from "../../../../app/components/ui/Button/Button";
import ImageWithFallback from "../../../../app/components/ui/ImageWithFallback/ImageWithFallback";
import { getUserFullName, getUserInitials } from "../profileHelpers";
import styles from "./ProfileHero.module.scss";
import { useUploadProfileImageMutation } from "../../hooks/useUploadProfileImageMutation";
import { showErrorToast, showSuccessToast } from "../../../../lib/toast";

export default function ProfileHero({
  user,
  onSave,
  isSaving,
  isEditing,
  locationLabel,
  handleStartEditing,
  handleCancelEditing,
  hasPassword,
}) {
  const fullName = getUserFullName(user) || "Your profile";
  const initials = getUserInitials(user);
  const fileInputRef = useRef(null);

  const uploadProfileImageMutation = useUploadProfileImageMutation();

  const handleProfileImageChange = useCallback(
    async (event) => {
      const selectedFile = event.target.files?.[0];

      if (!selectedFile) {
        return;
      }

      const uploadData = new FormData();
      uploadData.append("file", selectedFile);

      try {
        await uploadProfileImageMutation.mutateAsync(uploadData);
        showSuccessToast(
          user?.image_url
            ? "Profile photo updated successfully."
            : "Profile photo uploaded successfully."
        );
      } catch (error) {
        showErrorToast(
          error?.response?.data?.detail ||
            "We couldn't upload your photo. Please try again."
        );
      } finally {
        event.target.value = "";
      }
    },
    [uploadProfileImageMutation]
  );

  return (
    <section className={styles.heroCard}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleProfileImageChange}
      />

      <div className={styles.heroIdentity}>
        <div className={styles.avatarWrap}>
          <ImageWithFallback
            imageUrl={user?.image_url}
            alt={fullName}
            fallbackText={initials}
            className={styles.avatarImage}
            imgClassName={styles.avatarImage}
          />
        </div>

        <div className={styles.heroText}>
          <p className={styles.heroName}>{fullName}</p>
          <p className={styles.heroHandle}>
            {user?.username ? `@${user.username}` : "Username not added"}
          </p>
          {locationLabel ? (
            <p className={styles.heroMeta}>{locationLabel}</p>
          ) : (
            <p className={styles.heroMetaMuted}>Location not added</p>
          )}
        </div>
      </div>

      <div className={styles.heroActions}>
        {isEditing ? (
          <>
            {hasPassword && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                loading={uploadProfileImageMutation.isPending}
                loadingText={
                  user?.image_url ? "Updating photo..." : "Uploading photo..."
                }
              >
                {user?.image_url ? "Change Photo" : "Upload Photo"}
              </Button>
            )}
            <div className={styles.editActions}>
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                onClick={handleCancelEditing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onSave}
                loading={isSaving}
                loadingText="Saving changes..."
              >
                Save Changes
              </Button>
            </div>
          </>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleStartEditing}
          >
            Edit Profile
          </Button>
        )}
      </div>
    </section>
  );
}
