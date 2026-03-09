 "use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    moe?: any;
    Moengage?: any;
    __CSP_NONCE__?: string;
    __MOENGAGE_INITIALIZED__?: boolean;
  }
}

const MOENGAGE_DATA_CENTER = process.env.NEXT_PUBLIC_MOENGAGE_DATA_CENTER;
const MOENGAGE_APP_ID = process.env.NEXT_PUBLIC_MOENGAGE_APP_ID;
const MOENGAGE_ENV = process.env.NEXT_PUBLIC_MOENGAGE_ENV;

function getCspNonce() {
  if (typeof document === "undefined") return "";
  const fromMeta =
    document
      .querySelector('meta[name="csp-nonce"]')
      ?.getAttribute("content") || "";
  if (fromMeta && fromMeta !== "__CSP_NONCE__") return fromMeta;
  return (typeof window !== "undefined" && window.__CSP_NONCE__) || "";
}

function initMoengageWithNonce(
  nonce: string,
  moeDataCenter: string,
  moeAppID: string
) {
  const sdkVersion = "2";
  const scriptUrl = `https://cdn.moengage.com/release/${moeDataCenter}/versions/${sdkVersion}/moe_webSdk.min.latest.js`;
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${scriptUrl}"]`
  );
  if (existing) {
    if (typeof window.moe === "function") {
      window.Moengage = window.moe({
        app_id: moeAppID,
        env: MOENGAGE_ENV,
        logLevel: 0,
        contentSecurityNonce: nonce,
      });
      window.__MOENGAGE_INITIALIZED__ = true;
    }
    return;
  }

  const script = document.createElement("script");
  script.nonce = nonce;
  script.type = "text/javascript";
  script.async = true;
  script.src = scriptUrl;
  script.onload = () => {
    if (window.__MOENGAGE_INITIALIZED__) return;
    if (typeof window.moe === "function") {
      window.Moengage = window.moe({
        app_id: moeAppID,
        env: MOENGAGE_ENV,
        logLevel: 1,
        contentSecurityNonce: nonce,
      });
      window.__MOENGAGE_INITIALIZED__ = true;
    }
  };
  script.onerror = () => {
    console.error("MoEngage Web SDK loading failed.");
  };
  document.head.appendChild(script);
}

export function loadAndInitMoengage() {
  if (typeof window === "undefined") return;
  if (window.__MOENGAGE_INITIALIZED__) return;

  const moeDataCenter = MOENGAGE_DATA_CENTER;
  const moeAppID = MOENGAGE_APP_ID;

  if (!moeAppID) return;

  if (!moeDataCenter || !/^dc_[0-9]+$/.test(moeDataCenter)) {
    console.error(
      "MoEngage: Data center not set correctly. Use dc_1, dc_2, dc_3, etc."
    );
    return;
  }

  const nonce = getCspNonce();
  initMoengageWithNonce(nonce, moeDataCenter, moeAppID);
}

export default function Home() {
  const moengageInitRef = useRef(false);

  useEffect(() => {
    if (moengageInitRef.current) return;
    moengageInitRef.current = true;
    try {
      loadAndInitMoengage();
    } catch (e) {
      console.error("error in initializing moengage", e);
    }
  }, []);

  const handlePublishMoengageEvent = () => {
    try {
      if (typeof window === "undefined" || !window.Moengage) {
        console.error("MoEngage is not initialized yet.");
        return;
      }

      const location = window.location?.pathname || "UNKNOWN_LOCATION";

      window.Moengage.track_event(location, {
        plan_name: "test_plan",
        account_status: "test_status",
      });
    } catch (e) {
      console.error(
        "error in tracking moengage event for NAVIGATION_CLICK",
        e
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
          <button
            type="button"
            onClick={handlePublishMoengageEvent}
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[220px]"
          >
            Publish MoEngage Test Event
          </button>
        </div>
      </main>
    </div>
  );
}
