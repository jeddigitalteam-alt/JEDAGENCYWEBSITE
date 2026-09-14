"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useIntro } from "@/components/motion/intro-context";
import { buttonClass } from "@/components/ui/primitives";
import {
  closeConsentSettings,
  consentSnapshot,
  saveChoice,
  subscribeConsent,
} from "@/lib/consent";

/**
 * The cookie banner, and the same panel reopened from the footer.
 *
 * Not a modal. Nothing behind it is blocked or dimmed, and no amount of
 * scrolling, clicking elsewhere or navigating counts as an answer: until one of
 * the two buttons is pressed, analytics stays at the denied default set in the
 * <head>. A first-time visitor gets no close button for the same reason — a
 * dismissal would have to mean something, and it means nothing.
 *
 * The two buttons are the same pill at the same weight. Making "accept" the
 * blue one is the nudge the rules on consent exist to stop.
 *
 * Rendered null on the server: the choice lives in localStorage, so a server
 * render would show the banner to people who have already answered and yank it
 * away at hydration. It also waits for the intro loader to clear, which covers
 * the page for its first two seconds anyway.
 */
export default function CookieConsent() {
  const { introDone } = useIntro();
  const snapshot = useSyncExternalStore(
    subscribeConsent,
    consentSnapshot,
    () => null,
  );
  const heading = useRef<HTMLHeadingElement>(null);

  const [choice, panel] = snapshot?.split("|") ?? [];
  const reopened = panel === "open";
  const visible = introDone && snapshot !== null && (choice === "unset" || reopened);

  /* Opened from the footer: move focus into the panel so a keyboard user is
     not left on a link near the bottom of the page, and let Escape put it
     away again. Escape is only offered once there is a saved answer to fall
     back on. */
  useEffect(() => {
    if (!visible || !reopened) return;
    heading.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConsentSettings();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, reopened]);

  if (!visible) return null;

  const pill = `${buttonClass("ghost")} w-full cursor-pointer px-4 text-center`;

  return (
    <section
      aria-labelledby="cookie-consent-title"
      data-cookie-consent
      className="fixed inset-x-4 z-[90] rounded-2xl border border-rule bg-surface-raised p-5 text-content shadow-[0_12px_40px_color-mix(in_oklab,var(--ink)_60%,transparent)] sm:right-auto sm:max-w-md md:left-8 md:p-6"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <h2
        id="cookie-consent-title"
        ref={heading}
        tabIndex={-1}
        className="mono text-content-dim"
      >
        Cookie settings
      </h2>
      <p className="mt-3 text-step--1 leading-relaxed">
        We&rsquo;d like to use optional analytics cookies (Google Analytics) to
        understand how people use this website and improve it. They are only
        set if you accept. We don&rsquo;t use advertising cookies. Read
        our{" "}
        {/* Following it is not an answer: the banner stays up on /privacy. */}
        <Link
          href="/privacy"
          className="underline decoration-[color:var(--link-underline)] decoration-1 underline-offset-4 transition-colors hover:text-accent"
        >
          Privacy Policy
        </Link>
        .
      </p>
      {reopened && choice !== "unset" ? (
        <p className="mono mt-3 text-content-dim">
          Currently: analytics {choice === "granted" ? "accepted" : "rejected"}
        </p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={pill}
          onClick={() => saveChoice("granted")}
        >
          Accept analytics
        </button>
        <button
          type="button"
          className={pill}
          onClick={() => saveChoice("denied")}
        >
          Reject optional cookies
        </button>
      </div>
    </section>
  );
}
