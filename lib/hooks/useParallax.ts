"use client";

import { useCallback, useEffect, useRef } from "react";

interface ParallaxOptions {
  /** Factors are multiplied by this below `minWidth`. */
  mobileScale?: number;
  /** Viewport width under which movement is damped. */
  minWidth?: number;
  /** Ceiling in px per layer, so tall viewports can't drift past their slack. */
  maxPx?: number;
}

/**
 * Multi-layer vertical parallax driven by one rAF loop and one passive scroll
 * listener, regardless of how many layers there are.
 *
 * Hand-rolled rather than routed through Motion's scroll hooks: it writes
 * `transform` straight to each node with no React render per frame, and leaves
 * the hero's existing entrance animations completely untouched.
 *
 *  - one `scroll` listener, attached passively, coalesced into a single write
 *    per animation frame;
 *  - an IntersectionObserver gates the whole thing, so no scroll maths runs
 *    while the section is away from the viewport;
 *  - only `transform` is ever written — layout is never invalidated, so
 *    nothing below the hero can shift;
 *  - at scroll position zero every layer is at the identity transform, so the
 *    top of the page looks exactly as composed;
 *  - `prefers-reduced-motion` keeps every layer static, and movement is damped
 *    below `minWidth`; both re-sync live if they change mid-session;
 *  - listeners, observer, frame and inline styles are all torn down on unmount.
 *
 * Returns a ref for the section to measure against, and a `setLayer(i)` factory
 * producing a callback ref for each moving layer.
 */
export function useParallaxLayers(
  factors: number[],
  { mobileScale = 0.5, minWidth = 768, maxPx = 220 }: ParallaxOptions = {},
) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const layersRef = useRef<Array<HTMLElement | null>>([]);
  const factorsKey = factors.join(",");

  const setLayer = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      layersRef.current[index] = el;
    },
    [],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const layerFactors = factorsKey.split(",").map(Number);
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wideMq = window.matchMedia(`(min-width: ${minWidth}px)`);

    let frame = 0;
    let listening = false;
    let near = false;

    const clearLayers = () => {
      for (const el of layersRef.current) {
        if (!el) continue;
        el.style.transform = "";
        el.style.willChange = "";
      }
    };

    const read = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      // How far the section has travelled up past the viewport top, clamped to
      // its own height so the value can never run away on a long page.
      const scrolled = Math.min(Math.max(-rect.top, 0), rect.height);
      const damp = wideMq.matches ? 1 : mobileScale;

      for (let i = 0; i < layersRef.current.length; i++) {
        const el = layersRef.current[i];
        if (!el) continue;
        const factor = layerFactors[i] ?? 0;
        const y = Math.min(scrolled * factor * damp, maxPx);
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    const attach = () => {
      if (listening) return;
      listening = true;
      for (const el of layersRef.current) {
        if (el) el.style.willChange = "transform";
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      read();
    };

    const detach = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const sync = () => {
      const allowed = !reducedMq.matches;
      if (allowed && near) attach();
      else {
        detach();
        // Reduced motion rests at the composed, untransformed state.
        if (!allowed) clearLayers();
      }
    };

    // Only do scroll maths while the hero is in or near the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        sync();
      },
      { rootMargin: "25% 0px 25% 0px" },
    );
    observer.observe(section);

    reducedMq.addEventListener("change", sync);
    wideMq.addEventListener("change", onScroll);

    return () => {
      observer.disconnect();
      reducedMq.removeEventListener("change", sync);
      wideMq.removeEventListener("change", onScroll);
      detach();
      clearLayers();
    };
  }, [factorsKey, mobileScale, minWidth, maxPx]);

  return { sectionRef, setLayer };
}

export default useParallaxLayers;
