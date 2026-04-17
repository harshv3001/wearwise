"use client";

import { toast } from "@/vendor/react-toastify/index.mjs";

const BASE_OPTIONS = {
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export function showSuccessToast(message, options = {}) {
  return toast.success(message, { ...BASE_OPTIONS, ...options });
}

export function showErrorToast(message, options = {}) {
  return toast.error(message, { ...BASE_OPTIONS, ...options });
}

export function showInfoToast(message, options = {}) {
  return toast.info(message, { ...BASE_OPTIONS, ...options });
}

export function showWarningToast(message, options = {}) {
  return toast.warning(message, { ...BASE_OPTIONS, ...options });
}

export function dismissToast(toastId) {
  toast.dismiss(toastId);
}
