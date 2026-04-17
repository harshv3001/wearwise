"use client";

import { useState } from "react";
import Button from "../../../../app/components/ui/Button";
import Input from "../../../../app/components/ui/Input/Input";
import { useChangePasswordMutation } from "../../hooks/useChangePasswordMutation";
import { logoutUser } from "../../../../lib/session";
import SectionHeader from "../SectionHeader/SectionHeader";
import {
  buildChangePasswordErrors,
  EMPTY_PASSWORD_FORM,
} from "../profileHelpers";
import { hasValidationErrors } from "../../../../lib/helperFunctions";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../../../../lib/toast";
import styles from "./AccountSecurityCard.module.scss";

export default function AccountSecurityCard({ hasPassword }) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const changePasswordMutation = useChangePasswordMutation();

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    setPasswordMessage("");
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setPasswordErrors({});
    setPasswordMessage("");
  };

  const handleSubmitPasswordChange = async () => {
    const nextErrors = buildChangePasswordErrors(passwordForm);
    setPasswordErrors(nextErrors);
    setPasswordMessage("");

    if (
      hasValidationErrors(nextErrors, [
        "current_password",
        "new_password",
        "confirm_new_password",
      ])
    ) {
      return;
    }

    try {
      await changePasswordMutation.mutateAsync(passwordForm);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setPasswordErrors({});
      setPasswordMessage("");
      setIsChangingPassword(false);
      showSuccessToast("Password updated successfully.");
    } catch (error) {
      const detail =
        error?.response?.data?.detail ||
        "We couldn't update your password. Please try again.";

      if (typeof detail === "string") {
        if (detail.toLowerCase().includes("current password")) {
          setPasswordErrors((prev) => ({ ...prev, current_password: detail }));
        } else if (detail.toLowerCase().includes("match")) {
          setPasswordErrors((prev) => ({
            ...prev,
            confirm_new_password: detail,
          }));
        } else if (detail.toLowerCase().includes("different")) {
          setPasswordErrors((prev) => ({ ...prev, new_password: detail }));
        }
      }

      setPasswordMessage(
        typeof detail === "string"
          ? detail
          : "We couldn't update your password. Please try again."
      );
      showErrorToast(
        typeof detail === "string"
          ? detail
          : "We couldn't update your password. Please try again."
      );
    }
  };

  return (
    <section className={styles.card}>
      <SectionHeader
        title="Account & Security"
        description="Manage how you sign in and keep this account accessible."
      />

      <div className={styles.accountStack}>
        {hasPassword && (
          <div className={styles.securityBlock}>
            <p className={styles.fieldLabel}>Change Password</p>
            {isChangingPassword ? (
              <div className={styles.passwordPanel}>
                <div className={styles.passwordGrid}>
                  <Input
                    label="Current Password"
                    name="current_password"
                    type="password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordInputChange}
                    error={passwordErrors.current_password}
                  />
                  <Input
                    label="New Password"
                    name="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordInputChange}
                    error={passwordErrors.new_password}
                  />
                  <Input
                    label="Confirm New Password"
                    name="confirm_new_password"
                    type="password"
                    value={passwordForm.confirm_new_password}
                    onChange={handlePasswordInputChange}
                    error={passwordErrors.confirm_new_password}
                  />
                </div>

                {passwordMessage ? (
                  <p
                    className={
                      changePasswordMutation.isError
                        ? styles.passwordError
                        : styles.passwordSuccess
                    }
                  >
                    {passwordMessage}
                  </p>
                ) : null}

                <div className={styles.passwordActions}>
                  <Button
                    type="button"
                    variant="tertiary"
                    size="sm"
                    onClick={handleCancelPasswordChange}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitPasswordChange}
                    loading={changePasswordMutation.isPending}
                    loadingText="Updating password..."
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className={styles.sectionCopy}>
                  Update your password with one secure confirmation step.
                </p>
                {passwordMessage ? (
                  <p className={styles.passwordSuccess}>{passwordMessage}</p>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsChangingPassword(true);
                    setPasswordErrors({});
                    setPasswordMessage("");
                  }}
                >
                  Change Password
                </Button>
              </>
            )}
          </div>
        )}

        <div className={styles.securityBlock}>
          <p className={styles.fieldLabel}>Sign Out</p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              showInfoToast("Signed out successfully.");
              logoutUser();
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </section>
  );
}
