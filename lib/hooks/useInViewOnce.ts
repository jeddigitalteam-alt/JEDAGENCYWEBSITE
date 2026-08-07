"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * True once the element has been seen, and true forever after.
 *
 * A plain IntersectionObserver rather than Motion's `whileInView`. That prop
 * works elsewhere on the site — the LEVANT palette uses it — but on the
 * homepage it does not register: the `initial` state is applied and the
 * animation never runs, so the element stays at its start values permanently.
 * Traced with the element parked 279px inside the viewport for two seconds with
 * no callback, on both a `motion.span` and a `motion.div`. Rather than ship an
 * entrance that silently never plays, this owns the observation outright.
 *
 * One-way by construction: the observer disconnects on the first intersection,
 * so scrolling back up cannot unset it and there is no second callback to
 * handle. That matches how every other reveal on the site behaves.
 *
 * `margin` is in px on purpose — a percentage `rootMargin` is not reliably
 * honoured, and the sizes here are small enough that px is the clearer unit.
 */
export function useInViewOnce<T extends HTMLElement>(
  {
    margin = "-80px",
    immediate = false,
  }: {
    margin?: string;
    /**
     * Latch on mount instead of waiting to be seen. For reduced motion, where
     * there is no entrance to stage and the content should simply be present.
     *
     * Deliberately consumed here, inside an effect, rather than by the caller
     * folding it into what it renders. Anything that changes the first render
     * based on `useReducedMotion()` disagrees with the server, which reads
     * `null` — and a component that animates from `opacity: 0` turns that
     * disagreement into invisible content. Flipping the latch after hydration
     * cannot mismatch.
     */
    immediate?: boolean;
  } = {},
): { ref: RefObject<T | null>; seen: boolean } {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;

    // Nothing to wait for: either the caller asked for it outright, or the
    // element is already on screen — a deep link, a restored scroll position,
    // or simply a short page.
    const rect = el.getBoundingClientRect();
    if (immediate || (rect.top < window.innerHeight && rect.bottom > 0)) {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, seen, immediate]);

  return { ref, seen };
}

export default useInViewOnce;
