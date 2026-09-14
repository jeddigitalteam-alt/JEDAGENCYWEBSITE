"use client";

import type { ReactNode } from "react";
import { openConsentSettings } from "@/lib/consent";

/**
 * Reopens the consent panel from inside server-rendered copy — the Privacy
 * Policy — where an onClick cannot live. A button, not a link: it goes nowhere.
 */
export default function CookieSettingsButton({
  className = "",
  children = "Cookie settings",
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
