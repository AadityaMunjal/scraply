"use client";
import { QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "~/util/queryClient";
import { DemoProvider } from "~/state/DemoContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <DemoProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </DemoProvider>
  );
}
