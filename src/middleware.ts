import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Generates a cryptographically secure nonce for CSP.
 * Must be unique per page load for effective security.
 */
function generateCspNonce(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function middleware(request: NextRequest) {
  const nonce = generateCspNonce();

  // Forward nonce to layout so it can inject <meta name="csp-nonce" content="...">
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-csp-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // CSP: allow MoEngage SDK and app domains; script-src uses nonce for inline/dynamic scripts
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'nonce-" +
      nonce +
      "' https://cdn.moengage.com/ https://app-cdn.moengage.com/ https://*.moengage.com",
    "connect-src 'self' https://cdn.moengage.com/ https://app-cdn.moengage.com/ https://*.moengage.com https://us.i.posthog.com https://app.posthog.com https://eu.i.posthog.com wss://us.i.posthog.com wss://eu.i.posthog.com",
    "img-src 'self' data: https: blob: https://cdn.moengage.com/ https://app-cdn.moengage.com/ https://*.moengage.com https://image.moengage.com/ https://moe-email-campaigns.s3.amazonaws.com/ https://us.i.posthog.com https://app.posthog.com https://eu.i.posthog.com",
    "style-src 'self' 'unsafe-inline' 'unsafe-hashes' https://*.moengage.com https://fonts.bunny.net",
    "font-src 'self' https://fonts.googleapis.com/ https://fonts.gstatic.com/ https://*.moengage.com",
    "frame-src 'self' https://*.moengage.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}
