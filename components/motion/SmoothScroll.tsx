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
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
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
