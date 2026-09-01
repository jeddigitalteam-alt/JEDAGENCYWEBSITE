"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { setLenis } from "./lenis-instance";

/**
 * Lenis smooth scroll.
 *
 * Not mounted at all under reduced motion — Lenis hijacks wheel events even
 * with duration 0, which is exactly what those users are asking us not to do.
 * The media query is re-checked live so a mid-session OS change takes effect.
 */
export function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let raf = 0;
    let growth: ResizeObserver | null = null;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        duration: 1.05,
        // Expo-out, matching --ease-lock so scroll shares the site's feel.
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      });
      setLenis(lenis);

      /* Keep the scroll limit honest while the page is open.

         Lenis watches `content` for height changes, and `content` defaults to
         <html> — which this document pins to `height: 100%` via the `h-full`
         in app/layout.tsx. That element's box is therefore always exactly the
         viewport, so it never reports a resize and Lenis never re-measures.
         The limit stays frozen at whatever the page was when Lenis started,
         and anything that grows the page afterwards is simply unreachable:
         the contact form's last step is taller than its first, and the extra
         height could not be scrolled to at all.

         <body> is the element that actually grows with the content, so that is
         what gets measured. `resize()` is the same call `resetScroll` already
         makes on a route change, for the same stale-limit reason. */
      growth = new ResizeObserver(() => lenis?.resize());
      growth.observe(document.body);

      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      growth?.disconnect();
      growth = null;
      lenis?.destroy();
      lenis = null;
      setLenis(null);
    };

    const sync = () => (mq.matches ? stop() : start());

    sync();
    mq.addEventListener("change", sync);

    return () => {
      mq.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}

export default SmoothScroll;
