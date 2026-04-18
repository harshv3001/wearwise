"use client";

import { ToastContainer } from "@/vendor/react-toastify/index.mjs";

export default function AppToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3200}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
      limit={4}
      toastClassName={() => "ww-toast"}
      bodyClassName={() => "ww-toast-body"}
      progressClassName="ww-toast-progress"
    />
  );
}
