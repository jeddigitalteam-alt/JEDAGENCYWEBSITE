"use client";

import { motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { PIECE_A, PIECE_B, VIEWBOX } from "@/components/brand/puzzle-paths";
import { useFinePointer, useReducedMotionPref } from "@/lib/hooks/useMediaQuery";

/** Resting size in px. Small enough to track, large enough to read as the mark. */
const SIZE = 18;
/** Size over anything clickable — the only interaction feedback it carries. */
const SIZE_ACTIVE = 26;

/**
 * Custom cursor: the Puzzle mark itself, following the pointer.
 *
 * Geometry is imported from ./brand/puzzle-paths, the same source the header and
 * footer logos use, so the cursor can never drift from the logo. Nothing here
 * modifies it.
 *
 * Position is written straight to motion values with no spring. A spring would
 * make the mark lag the pointer, which is both a trailing effect and harder to
 * aim with — a cursor has to sit exactly where the pointer is. Only the size
 * animates, and only between two values.
 *
 * Only mounts on fine-pointer devices that aren't asking for reduced motion, so
 * touch and mobile keep the native cursor behaviour and lose nothing: every
 * affordance is still carried by the elements themselves.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotionPref();
  const enabled = fine && !reduced;
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    if (!enabled) return;

    // NB: `customCursor`, not `cursor`. `data-cursor` is the per-element label
    // attribute and must never be set on <body> — see globals.css.
    document.body.dataset.customCursor = "on";

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setActive(
        !!(e.target as HTMLElement)?.closest("[data-cursor], a, button"),
      );
    };
    const onLeave = () => {
      setActive(false);
      x.set(-100);
      y.set(-100);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      delete document.body.dataset.customCursor;
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.svg
      viewBox={VIEWBOX}
      className="pointer-events-none fixed left-0 top-0 z-[80] text-blue"
      style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      animate={{ width: active ? SIZE_ACTIVE : SIZE, height: active ? SIZE_ACTIVE : SIZE }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PIECE_A} />
      <path d={PIECE_B} />
    </motion.svg>
  );
}

export default Cursor;
