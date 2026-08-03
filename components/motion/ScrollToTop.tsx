"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { resetScroll } from "./lenis-instance";

/**
 * Every navigation starts at the top.
 *
 * The App Router already scrolls to the top on client navigation — that part
 * was never broken. What was broken is the browser's own scroll restoration:
 * `history.scrollRestoration` defaults to "auto", so reloading a page you had
 * scrolled halfway down puts you back halfway down, and revisiting a URL from
 * session history does the same. That is the "sometimes opens near the bottom"
 * case.
 *
 * Turning restoration off is done here rather than per page, so there is one
 * place that owns it. A hash is honoured: `/contact#form` still lands on the
 * anchor, because the browser resolves it and we do not fight it.
 *
 * Note this also means back/forward return to the top rather than to the
 * previous scroll position. That is the direct trade-off for reload landing at
 * the top; both are the same browser mechanism.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Belt and braces: the inline script in the document head already sets this
    // before first paint, which is the only place early enough to beat the
    // browser's own restore on reload. Re-asserting it here keeps the setting
    // correct if anything later puts it back to "auto".
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // An explicit anchor is a deliberate destination — leave it alone.
    if (window.location.hash) return;

    // Reset once now, then again on the next frame. The first call handles the
    // common case; the second lands after the incoming route has painted and
    // its real height is known, which is what stops a long page (the Levant
    // case study is the tallest) from settling back to the old offset.
    resetScroll();
    const raf = requestAnimationFrame(resetScroll);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
