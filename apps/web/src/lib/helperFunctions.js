export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "-";
  const amount = Number(value);
  return Number.isNaN(amount) ? String(value) : `$${amount}`;
}

export function formatDisplayValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

export function formatCapitalizedValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;

  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test((value || "").trim());
}

export function validateRequired(value, message) {
  return String(value || "").trim() ? "" : message;
}

export function validateEmail(value, { requiredMessage, invalidMessage }) {
  const trimmedValue = (value || "").trim();

  if (!trimmedValue) {
    return requiredMessage;
  }

  return isValidEmail(trimmedValue) ? "" : invalidMessage;
}

export function validatePassword(value, { requiredMessage, minLength, minLengthMessage }) {
  const trimmedValue = String(value || "");

  if (!trimmedValue) {
    return requiredMessage;
  }

  if (trimmedValue.length < minLength) {
    return minLengthMessage;
  }

  return "";
}

export function validatePasswordConfirmation(password, confirmation, { requiredMessage, mismatchMessage }) {
  if (!confirmation) {
    return requiredMessage;
  }

  return password === confirmation ? "" : mismatchMessage;
}

export function hasValidationErrors(errorMap, fields) {
  return fields.some((field) => Boolean(errorMap[field]));
}

export function validatePositiveNumber(value, { requiredMessage, invalidMessage, allowZero = false }) {
  if (value === "" || value === null || value === undefined) {
    return requiredMessage;
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return invalidMessage;
  }

  if (allowZero ? numericValue < 0 : numericValue <= 0) {
    return invalidMessage;
  }

  return "";
}

export function getPlaceholderValue(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}
