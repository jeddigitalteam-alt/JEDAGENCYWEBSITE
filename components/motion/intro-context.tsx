"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SESSION_KEY = "puzzle:intro-seen";

type IntroPhase = "pending" | "running" | "done";

interface IntroState {
  /** True once the hero is cleared to animate in. */
  introDone: boolean;
  /** `null` until the client has decided — avoids a hydration flash. */
  shouldRun: boolean | null;
  /** Reduced-motion users get the static 300ms path. */
  reduced: boolean;
  markIntroDone: () => void;
}

const IntroContext = createContext<IntroState>({
  introDone: true,
  shouldRun: false,
  reduced: false,
  markIntroDone: () => {},
});

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<IntroPhase>("pending");
  const [shouldRun, setShouldRun] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);

  // Decided on the client only: sessionStorage and the media query are both
  // unavailable during SSR, and guessing either would cause a flash.
  //
  // Deferred a frame rather than set synchronously in the effect body — the
  // loader renders nothing until `shouldRun` resolves, so a single frame costs
  // nothing and this avoids the cascading render the lint rule warns about.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setReduced(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );

      let seen = false;
      try {
        seen = sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {
        // Private browsing / storage disabled — treat as unseen, never throw.
        seen = false;
      }

      setShouldRun(!seen);
      setPhase(seen ? "done" : "running");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const markIntroDone = useCallback(() => {
    setPhase("done");
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Non-fatal: the intro simply runs again next navigation.
    }
  }, []);

  const value = useMemo<IntroState>(
    () => ({
      introDone: phase === "done",
      shouldRun,
      reduced,
      markIntroDone,
    }),
    [phase, shouldRun, reduced, markIntroDone],
  );

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

/**
 * Read the intro state. The hero uses `introDone` to start its entrance on cue,
 * so the panel clearing and the hero animating in are one continuous move.
 */
export function useIntro() {
  return useContext(IntroContext);
}
