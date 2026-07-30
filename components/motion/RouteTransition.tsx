"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const { shouldRun, introDone } = useIntro();
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(false);
  const [firstPaint, setFirstPaint] = useState(true);

  useEffect(() => {
    // Don't fire on the initial render, or while the intro loader is on screen.
    if (firstPaint) {
      setFirstPaint(false);
      return;
    }
    if (reduced) return;
    if (shouldRun === true && !introDone) return;

    setActive(true);
    setOpen(false);

    // Part the panels on the next frame so the closed state paints first.
    const raf = requestAnimationFrame(() => setOpen(true));
    const done = setTimeout(() => setActive(false), DUR * 1000 + 120);

    return () => {
      cancelAnimationFrame(raf);
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
