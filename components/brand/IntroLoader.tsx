"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/components/motion/intro-context";
import SeamPanels from "@/components/motion/SeamPanels";
import {
  PIECE_A,
  PIECE_B,
  PIECE_OFFSETS,
  VIEWBOX,
} from "@/components/brand/puzzle-paths";

/* --- timing -------------------------------------------------------------
   Hero is cued at CLEAR_AT (1.75s) and the overlay is pointer-events-none
   throughout, so interactivity is never blocked beyond the ~2s ceiling. */
const DRAW_DUR = 0.9;
const DRAW_B_DELAY = 0.2;
const COUNTER_MS = 1150;
const LOCK_AT = 1.15;
const LOCK_DUR = 0.5;
/* The lock lands at 1.65s. Hold it before clearing — without this beat the
   moment the mark exists whole is the same moment it starts fading, which
   throws away the thing the sequence is built around. */
const LOCK_HOLD = 0.22;
const CLEAR_AT = LOCK_AT + LOCK_DUR + LOCK_HOLD;
const CLEAR_DUR = 0.45;
const REDUCED_HOLD_MS = 300;

const EASE_LOCK = [0.16, 1, 0.3, 1] as const;

export function IntroLoader() {
  const { shouldRun, reduced, markIntroDone } = useIntro();
  const [locked, setLocked] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  /* Numeric counter, eased so it decelerates like a real load rather than
     ticking linearly. */
  useEffect(() => {
    if (shouldRun !== true || reduced) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNTER_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [shouldRun, reduced]);

  useEffect(() => {
    if (shouldRun !== true) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    if (reduced) {
      // Static mark, brief hold, clear. No draw, no lock travel.
      setCount(100);
      setLocked(true);
      at(() => {
        setCleared(true);
        markIntroDone();
      }, REDUCED_HOLD_MS);
      at(() => setRemoved(true), REDUCED_HOLD_MS + 120);
    } else {
      at(() => setLocked(true), LOCK_AT * 1000);
      at(() => setCleared(true), CLEAR_AT * 1000);
      // Cue the hero the moment the panels begin to part, so the reveal and
      // the hero entrance read as one continuous move.
      at(markIntroDone, CLEAR_AT * 1000);
      at(() => setRemoved(true), (CLEAR_AT + CLEAR_DUR) * 1000 + 80);
    }

    return () => timers.forEach(clearTimeout);
  }, [shouldRun, reduced, markIntroDone]);

  // `null` = the client hasn't decided yet; render nothing rather than flash.
  if (shouldRun !== true || removed) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <SeamPanels open={cleared} duration={reduced ? 0.01 : CLEAR_DUR} />

      {/* Mark sits above the panels and is deliberately NOT rotated. */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={{ opacity: cleared ? 0 : 1, scale: cleared ? 1.04 : 1 }}
        transition={{ duration: 0.3, ease: EASE_LOCK }}
      >
        <svg
          viewBox={VIEWBOX}
          className="w-[min(52vw,30rem)] text-blue"
          fill="none"
          stroke="currentColor"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Puzzle"
        >
          {[PIECE_A, PIECE_B].map((d, i) => (
            <motion.g
              key={i}
              initial={
                reduced
                  ? false
                  : { x: PIECE_OFFSETS[i].x, y: PIECE_OFFSETS[i].y }
              }
              animate={
                locked
                  ? {
                      // Overshoot slightly past the seam, then settle on
                      // exactly 0 — never a residual offset.
                      x: [PIECE_OFFSETS[i].x, PIECE_OFFSETS[i].x * -0.07, 0],
                      y: [PIECE_OFFSETS[i].y, PIECE_OFFSETS[i].y * -0.07, 0],
                    }
                  : { x: PIECE_OFFSETS[i].x, y: PIECE_OFFSETS[i].y }
              }
              transition={{
                duration: reduced ? 0 : LOCK_DUR,
                ease: EASE_LOCK,
                times: [0, 0.72, 1],
              }}
            >
              <motion.path
                d={d}
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reduced ? 0 : DRAW_DUR,
                  delay: reduced ? 0 : i * DRAW_B_DELAY,
                  ease: "easeInOut",
                }}
              />
            </motion.g>
          ))}
        </svg>
      </motion.div>

      {/* Mono counter, bottom-left — the LEVANT micro-type voice. */}
      <motion.div
        className="mono absolute bottom-6 left-6 text-paper-dim md:bottom-8 md:left-8"
        animate={{ opacity: cleared ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <span aria-hidden="true">Loading {String(count).padStart(3, "0")}</span>
        <span className="sr-only" role="status" aria-live="polite">
          {count === 100 ? "Loaded" : "Loading"}
        </span>
      </motion.div>
    </div>
  );
}

export default IntroLoader;
