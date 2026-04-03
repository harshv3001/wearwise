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
