import {
  getPlaceholderValue,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validatePositiveNumber,
  validateRequired,
} from "../../../lib/helperFunctions";

export const EMPTY_PROFILE_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  age: "",
  gender: "",
  country: "",
  country_code: "",
  state: "",
  state_code: "",
  city: "",
  latitude: null,
  longitude: null,
  pref_styles: [],
  pref_colors: [],
};

export const EMPTY_PASSWORD_FORM = {
  current_password: "",
  new_password: "",
  confirm_new_password: "",
};

export function buildProfileFormData(user) {
  if (!user) {
    return EMPTY_PROFILE_FORM;
  }

  return {
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    age: user.age ?? "",
    gender: user.gender ?? "",
    country: user.country ?? "",
    country_code: user.country_code ?? "",
    state: user.state ?? "",
    state_code: user.state_code ?? "",
    city: user.city ?? "",
    latitude: user.latitude ?? null,
    longitude: user.longitude ?? null,
    pref_styles: Array.isArray(user.pref_styles) ? user.pref_styles : [],
    pref_colors: Array.isArray(user.pref_colors) ? user.pref_colors : [],
  };
}

export function normalizeProfilePayload(formData) {
  return {
    first_name: formData.first_name.trim(),
    last_name: formData.last_name.trim(),
    username: formData.username.trim() || null,
    email: formData.email.trim().toLowerCase(),
    age: formData.age === "" ? null : Number(formData.age),
    gender: formData.gender || null,
    country: formData.country.trim() || null,
    country_code: formData.country_code || null,
    state: formData.state.trim() || null,
    state_code: formData.state_code || null,
    city: formData.city.trim() || null,
    latitude: formData.latitude ?? null,
    longitude: formData.longitude ?? null,
    pref_styles: formData.pref_styles.length ? formData.pref_styles : null,
    pref_colors: formData.pref_colors.length ? formData.pref_colors : null,
  };
}

export function getUserInitials(user) {
  const initials = [user?.first_name, user?.last_name]
    .map((value) => value?.trim()?.[0] || "")
    .join("")
    .toUpperCase();

  return initials || "U";
}

export function getUserFullName(user) {
  return [user?.first_name, user?.last_name]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
}

export function getUserLocationLabel(user) {
  return [user?.city, user?.state, user?.country].filter(Boolean).join(", ");
}

export function countCompletedProfileDetails(user) {
  const checks = [
    Boolean(user?.image_url),
    Boolean(user?.first_name?.trim()),
    Boolean(user?.last_name?.trim()),
    Boolean(user?.username?.trim()),
    Boolean(user?.email?.trim()),
    Boolean(user?.gender?.trim()),
    user?.age !== null && user?.age !== undefined,
    Boolean(user?.country?.trim()),
    Boolean(user?.state?.trim()),
    Boolean(user?.city?.trim()),
    Array.isArray(user?.pref_styles) && user.pref_styles.length > 0,
    Array.isArray(user?.pref_colors) && user.pref_colors.length > 0,
  ];

  return checks.filter(Boolean).length;
}

export function computeProfileDiff(original, current) {
  return Object.fromEntries(
    Object.entries(current).filter(([key, value]) => {
      const orig = original[key];
      if (Array.isArray(value) && Array.isArray(orig)) {
        return JSON.stringify(value) !== JSON.stringify(orig);
      }
      return value !== orig;
    })
  );
}

export function buildProfileValidationErrors(formData) {
  const nextErrors = {
    first_name: validateRequired(formData.first_name, "First name is required."),
    last_name: validateRequired(formData.last_name, "Last name is required."),
    email: validateEmail(formData.email, {
      requiredMessage: "Email is required.",
      invalidMessage: "Enter a valid email address.",
    }),
    username: "",
    age: "",
  };

  const username = formData.username.trim();
  if (username) {
    if (username.length < 3) {
      nextErrors.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z]/.test(username)) {
      nextErrors.username = "Username must start with a letter.";
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      nextErrors.username =
        "Username can only use letters, numbers, dots, hyphens, and underscores.";
    }
  }

  if (formData.age !== "") {
    nextErrors.age = validatePositiveNumber(formData.age, {
      requiredMessage: "",
      invalidMessage: "Age must be between 1 and 120.",
      allowZero: false,
    });
    if (!nextErrors.age && Number(formData.age) > 120) {
      nextErrors.age = "Age must be between 1 and 120.";
    }
  }

  return nextErrors;
}

export function buildChangePasswordErrors(formData) {
  const nextErrors = {
    current_password: validateRequired(
      formData.current_password,
      "Current password is required."
    ),
    new_password: validatePassword(formData.new_password, {
      requiredMessage: "New password is required.",
      minLength: 8,
      minLengthMessage: "New password must be at least 8 characters.",
    }),
    confirm_new_password: validatePasswordConfirmation(
      formData.new_password,
      formData.confirm_new_password,
      {
        requiredMessage: "Please confirm your new password.",
        mismatchMessage: "New password and confirm password must match.",
      }
    ),
  };

  if (
    formData.current_password &&
    formData.new_password &&
    formData.current_password === formData.new_password
  ) {
    nextErrors.new_password =
      "New password must be different from your current password.";
  }

  return nextErrors;
}

export { getPlaceholderValue };
