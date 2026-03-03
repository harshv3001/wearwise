export function getApiErrorMessage(error, fallback = "An unknown error occurred") {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}