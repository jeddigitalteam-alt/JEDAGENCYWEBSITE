/**
 * Cookie consent — the one place the stored choice, the Consent Mode calls and
 * the settings panel's open state live.
 *
 * Only analytics is ever asked about. Puzzle runs GA4 and nothing else, so the
 * three advertising signals are denied by default and stay denied whatever the
 * visitor picks; granting them would be claiming consent nobody was asked for.
 *
 * Plain module, no "use client": `app/layout.tsx` (a server component) imports
 * `consentHeadScript` from here, so the storage key is written once.
 */

export const CONSENT_KEY = "puzzle:consent";
const CONSENT_VERSION = 1;

export type AnalyticsChoice = "granted" | "denied";

type StoredConsent = { v: number; analytics: AnalyticsChoice; at: string };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const ADS_DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

/**
 * The inline <head> script. Order is the whole point:
 *
 *   1. every signal defaults to denied;
 *   2. a saved "granted" is read synchronously and applied as an update;
 *   3. only then `gtag('js')` and `config`.
 *
 * gtag.js processes the dataLayer queue in order, so the config call can never
 * run under a state it has not been told about — a returning visitor who
 * rejected is never briefly granted, and one who accepted is measured from the
 * first hit. A storage read that throws (private mode, blocked storage) falls
 * through to the denied default.
 */
export const consentHeadScript = (measurementId: string) =>
  "window.dataLayer = window.dataLayer || [];" +
  "function gtag(){dataLayer.push(arguments);}" +
  "gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});" +
  `try{var c=JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_KEY)})||'null');` +
  `if(c&&c.v===${CONSENT_VERSION}&&c.analytics==='granted')gtag('consent', 'update', {analytics_storage: 'granted'});}catch(e){}` +
  "gtag('js', new Date());" +
  `gtag('config', ${JSON.stringify(measurementId)});`;

export function readChoice(): AnalyticsChoice | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Partial<StoredConsent>;
    if (c.v !== CONSENT_VERSION) return null;
    return c.analytics === "granted" || c.analytics === "denied"
      ? c.analytics
      : null;
  } catch {
    return null;
  }
}

/**
 * GA's own first-party cookies. Denying consent stops new ones being written
 * but leaves any from an earlier "accept" in place, so a change of mind removes
 * them too. Tried against the bare host and every parent domain, because gtag
 * sets them on the widest domain it can.
 */
function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid");
  const parts = location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i++) {
    domains.push(`; domain=.${parts.slice(i).join(".")}`);
  }
  for (const name of names) {
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${d}`;
    }
  }
}

/* ---------------------------------------------------------------- store ---
   A tiny external store, read with useSyncExternalStore: the choice really
   lives outside React (localStorage), and this keeps the component free of
   set-state-in-effect. */

let settingsOpen = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribeConsent(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** A primitive, so the snapshot is stable between renders. */
export const consentSnapshot = () =>
  `${readChoice() ?? "unset"}|${settingsOpen ? "open" : "closed"}`;

export function saveChoice(analytics: AnalyticsChoice) {
  try {
    const record: StoredConsent = {
      v: CONSENT_VERSION,
      analytics,
      at: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    /* Storage blocked: the choice still applies for this page view, the banner
       simply asks again next time — which is the correct failure. */
  }
  window.gtag?.("consent", "update", {
    analytics_storage: analytics,
    ...ADS_DENIED,
  });
  if (analytics === "denied") clearAnalyticsCookies();
  settingsOpen = false;
  emit();
}

/** The footer's "Cookie settings" link. */
export function openConsentSettings() {
  settingsOpen = true;
  emit();
}

/** Dismisses a reopened panel without changing the saved choice. */
export function closeConsentSettings() {
  settingsOpen = false;
  emit();
}
