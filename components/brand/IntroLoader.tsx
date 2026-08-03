"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/components/motion/intro-context";
import SeamPanels from "@/components/motion/SeamPanels";
import {
  LOADER_PIECE_A,
  LOADER_PIECE_B,
  LOADER_PIECE_OFFSETS,
  LOADER_SEAM_ANGLE_DEG,
  LOADER_VIEWBOX,
} from "@/components/brand/puzzle-loader-paths";

/**
 * ============================================================================
 *  LOADER ARTWORK LOCKED — DO NOT MODIFY WHEN EDITING THE SITE LOGO
 * ============================================================================
 *
 * This component draws the LOADER mark, not the site logo. Its geometry comes
 * from ./puzzle-loader-paths, a frozen copy that nothing else imports, so the
 * site logo (./PuzzleSiteLogo + ./puzzle-paths) can be changed freely without
 * touching what renders here.
 *
 * Locked: shape, stroke, animation, timing, positioning, and how the pieces
 * connect. The pieces are stroke-only outlines on ink and they lock edge to
 * edge — do NOT give them the site logo's blue fill or white keyline.
 */

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
  const rafRef = useRef<number | null>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  /* Paint the counter straight into the DOM. Held out of React state on
     purpose: as state this set 60 times a second, and every one of those
     re-rendered this component and reconciled the whole SVG — both animated
     groups and both paths — for the entire first second of the animation,
     which is exactly the window the pieces are drawing in. Writing the text
     node directly costs nothing and looks identical. */
  const paintCount = (v: number) => {
    if (countRef.current)
      countRef.current.textContent = `Loading ${String(v).padStart(3, "0")}`;
    if (statusRef.current && v === 100) statusRef.current.textContent = "Loaded";
  };

  useEffect(() => {
    if (shouldRun !== true || reduced) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNTER_MS, 1);
      // Eased so it decelerates like a real load rather than ticking linearly.
      const eased = 1 - Math.pow(1 - t, 3);
      paintCount(Math.round(eased * 100));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // paintCount only touches refs, so it is not a dependency.
  }, [shouldRun, reduced]);

  useEffect(() => {
    if (shouldRun !== true) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    if (reduced) {
      // Static mark, brief hold, clear. No draw, no lock travel.
      at(() => {
        paintCount(100);
        setLocked(true);
      }, 0);
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

  /* Rendered for `null` (the client has not decided yet) as well as `true`.
     Returning null while undecided meant the server sent no loader at all, so
     the homepage painted first and stayed on screen for the best part of a
     second before the loader mounted and covered it — a flash of the site,
     then a jump into the animation. The overlay is now in the very first
     frame; the only case that must not see it is a visitor who has already
     had the intro this session, and the inline script in the document has
     already marked that on <html> before this paints. */
  if (shouldRun === false || removed) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] [html[data-intro-seen]_&]:hidden"
    >
      <SeamPanels
        open={cleared}
        duration={reduced ? 0.01 : CLEAR_DUR}
        angleDeg={LOADER_SEAM_ANGLE_DEG}
      />

      {/* Mark sits above the panels and is deliberately NOT rotated. */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={{ opacity: cleared ? 0 : 1, scale: cleared ? 1.04 : 1 }}
        transition={{ duration: 0.3, ease: EASE_LOCK }}
      >
        <svg
          viewBox={LOADER_VIEWBOX}
          className="w-[min(52vw,30rem)] text-blue"
          fill="none"
          stroke="currentColor"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Puzzle"
        >
          {[LOADER_PIECE_A, LOADER_PIECE_B].map((d, i) => (
            <motion.g
              key={i}
              /* Only transform and opacity animate here, so declaring it lets
                 the compositor hold the pieces on their own layers instead of
                 re-rasterising them behind main-thread work. */
              style={{ willChange: "transform" }}
              initial={
                reduced
                  ? false
                  : {
                      x: LOADER_PIECE_OFFSETS[i].x,
                      y: LOADER_PIECE_OFFSETS[i].y,
                    }
              }
              animate={
                locked
                  ? { x: 0, y: 0 }
                  : {
                      x: LOADER_PIECE_OFFSETS[i].x,
                      y: LOADER_PIECE_OFFSETS[i].y,
                    }
              }
              /* Monotonic close along the seam normal, no overshoot.
                 This previously ran through a keyframe at -0.07 of the start
                 offset, which carried each piece past the seam and made the two
                 solids visibly cross before settling back onto 0. Travelling
                 straight to 0 on a decelerating curve removes that crossing;
                 EASE_LOCK is cubic-bezier(0.16, 1, 0.3, 1), whose control
                 points are all within [0,1], so it cannot overshoot either. */
              transition={{
                duration: reduced ? 0 : LOCK_DUR,
                ease: EASE_LOCK,
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
        {/* Both text nodes are written by paintCount via these refs, so the
            counter never re-renders the component while the mark animates. */}
        <span ref={countRef} aria-hidden="true">
          Loading 000
        </span>
        <span ref={statusRef} className="sr-only" role="status" aria-live="polite">
          Loading
        </span>
      </motion.div>
    </div>
  );
}

export default IntroLoader;
