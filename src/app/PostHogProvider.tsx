"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    __POSTHOG_INITIALIZED__?: boolean;
  }
}

const PH_PROJECT_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const PH_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

if (typeof window !== "undefined" && PH_PROJECT_API_KEY) {
  if (!window.__POSTHOG_INITIALIZED__) {
    posthog.init(PH_PROJECT_API_KEY, {
      api_host: PH_HOST,
      capture_pageview: false, // we will capture manually on route changes
    });
    window.__POSTHOG_INITIALIZED__ = true;
  }
}

function PostHogPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!PH_PROJECT_API_KEY) return;
    // basic pageview event
    posthog.capture("$pageview", {
      $current_pathname: pathname,
      $current_url: window.location.href,
      $current_search: searchParams?.toString(),
    });
  }, [pathname, searchParams]);

  return null;
}

export function AppPostHogProvider({ children }: { children: ReactNode }) {
  if (!PH_PROJECT_API_KEY) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={posthog}>
      <PostHogPageviewTracker />
      {children}
    </PostHogProvider>
  );
}

