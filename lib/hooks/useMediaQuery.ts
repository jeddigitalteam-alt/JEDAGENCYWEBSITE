"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a media query.
 *
 * `useSyncExternalStore` is the right tool here rather than useState +
 * useEffect: matchMedia *is* an external store, the server snapshot is
 * explicit, and it avoids the cascading-render pattern that
 * `react-hooks/set-state-in-effect` correctly flags.
 *
 * Server snapshot is always `false`, so the "no special condition" branch is
 * what renders during SSR and the client corrects on hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotionPref = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

export const useFinePointer = () =>
  useMediaQuery("(hover: hover) and (pointer: fine)");
