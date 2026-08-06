"use client";

import { usePathname } from "next/navigation";
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
  /**
   * True while a full-screen veil is over the page — right now that is the
   * route transition's seam panels.
   *
   * Anything with an entrance reads this so it does not spend that entrance
   * behind a cover. It flips on during the render that follows a pathname
   * change, before the new page's own components render, so a heading at the
   * top of the arriving route sees it on its very first render rather than a
   * frame later — a frame late is enough for an IntersectionObserver to have
   * already fired.
   */
  covered: boolean;
  /** Called by the veil when it has finished clearing. */
  uncover: () => void;
}

const IntroContext = createContext<IntroState>({
  introDone: true,
  shouldRun: false,
  reduced: false,
  markIntroDone: () => {},
  covered: false,
  uncover: () => {},
});

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<IntroPhase>("pending");
  const [shouldRun, setShouldRun] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);

  /* The veil. Raised here rather than in the route transition itself because
     of ordering: this provider sits above the routed tree, so adjusting the
     state during its render — React's documented pattern for deriving state
     from a changed input — means the flag is already true by the time the new
     page's components render for the first time. Doing it in the transition's
     effect would leave a window in which an above-the-fold heading could
     observe itself into view and play its entrance behind the panels, which
     is precisely the bug this exists to close. It is cleared by whoever raised
     the veil, via `uncover`. */
  const pathname = usePathname();
  const [veiledPath, setVeiledPath] = useState<string | null>(null);
  const [covered, setCovered] = useState(false);
  if (veiledPath !== pathname) {
    // First mount is not a route change: the intro loader owns that moment and
    // `introDone` already gates on it.
    setCovered(veiledPath !== null);
    setVeiledPath(pathname);
  }
  const uncover = useCallback(() => setCovered(false), []);

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
      covered,
      uncover,
    }),
    [phase, shouldRun, reduced, markIntroDone, covered, uncover],
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
