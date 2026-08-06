"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SeamPanels from "@/components/motion/SeamPanels";
import { PIECE_A, PIECE_B, VIEWBOX } from "@/components/brand/puzzle-paths";
import { useIntro } from "@/components/motion/intro-context";

const DUR = 0.45;

/**
 * The compressed intro: steps 3–4 only (lock, then clear) at ~450ms.
 *
 * The new route is already rendered behind the panels, so this reads as the
 * seam parting to reveal it rather than as a loading state. Skipped on first
 * paint — the intro loader owns that moment — and skipped entirely under
 * reduced motion.
 */
export function RouteTransition() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { shouldRun, introDone, uncover } = useIntro();
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(false);
  /* The route this effect last acted on. Comparing the path is what makes the
     effect idempotent: a boolean "first paint" flag is consumed by its first
     run, so a second run for the same mount (React Strict Mode double-invokes
     effects in dev, and it is on by default with the app router) would fall
     straight through and play a route transition over the intro loader. A
     repeated run for the same pathname now exits instead. */
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Same route as the last run — either the initial mount or a re-invocation.
    if (lastPath.current === pathname) return;
    const isInitial = lastPath.current === null;
    lastPath.current = pathname;
    /* The provider raises the veil on every route change, because it has to do
       so before the arriving page renders and cannot know yet whether this
       transition will actually play. Every path that does not play one has to
       put it back down, or entrances on the new page would wait forever. */
    if (isInitial) return;
    if (reduced) return uncover();
    /* `shouldRun` is null until the client has decided whether the intro plays.
       Testing `=== true` treated "undecided" as "no intro", which is the state
       during the exact window the loader is starting up, so this must block on
       anything that is not a settled "the intro is not running". */
    if (shouldRun !== false && !introDone) return uncover();

    // Two frames: the first mounts the panels closed, the second parts them —
    // so the covered state actually paints before the reveal starts. Both run
    // in callbacks rather than the effect body.
    let second = 0;
    const first = requestAnimationFrame(() => {
      setActive(true);
      setOpen(false);
      second = requestAnimationFrame(() => setOpen(true));
    });
    /* The panels are fully parted at DUR; the page is the reader's again from
       here, so this is the moment entrances on the new route are cleared to
       start. Uncovering with the same timer keeps the two in step. */
    const done = setTimeout(() => {
      setActive(false);
      uncover();
    }, DUR * 1000 + 160);

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      clearTimeout(done);
    };
    // Intentionally keyed on pathname only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (reduced || !active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      <SeamPanels open={open} duration={DUR} />
      <motion.div
        className="absolute inset-0 grid place-items-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          viewBox={VIEWBOX}
          className="w-16 text-blue md:w-20"
          fill="none"
          stroke="currentColor"
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d={PIECE_A} />
          <path d={PIECE_B} />
        </svg>
      </motion.div>
    </div>
  );
}

export default RouteTransition;
