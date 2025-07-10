"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "~/util/queryClient";
import { DemoProvider } from "~/state/DemoContext";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "always",
      defaults: "2025-05-24",
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <DemoProvider>{children}</DemoProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
