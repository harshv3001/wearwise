"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { AppToastProvider } from "./components/ui/feedback";

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <AppToastProvider />
    </QueryClientProvider>
  );
}
