"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useFinePointer, useReducedMotionPref } from "@/lib/hooks/useMediaQuery";

/**
 * Custom cursor: a blue disc that magnetises to links and becomes a labelled
 * disc over work tiles.
 *
 * Only mounts on fine-pointer devices that aren't asking for reduced motion.
 * Any element can set the label via `data-cursor="VIEW"`; nothing depends on
 * the cursor existing, so touch users lose nothing.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotionPref();
  const enabled = fine && !reduced;
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 900, damping: 45, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 900, damping: 45, mass: 0.4 });

  useEffect(() => {
    if (!enabled) return;

    // NB: this flag is `customCursor`, not `cursor`. `data-cursor` is the
    // per-element *label* attribute, and setting it on <body> made
    // closest("[data-cursor]") match the body from anywhere on the page — so
    // every hover rendered a disc labelled "on".
    document.body.dataset.customCursor = "on";

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-cursor], a, button",
      );
      setActive(!!el);
      setLabel(el?.dataset?.cursor ?? null);
    };
    const onLeave = () => {
      setActive(false);
      setLabel(null);
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
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[80] grid place-items-center rounded-full"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: label ? 88 : active ? 44 : 12,
        height: label ? 88 : active ? 44 : 12,
        backgroundColor: label ? "var(--blue)" : "transparent",
        borderWidth: label ? 0 : 1.5,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 rounded-full border-blue"
        style={{ borderWidth: label ? 0 : 1.5, borderStyle: "solid" }}
      />
      {label ? (
        <span className="mono text-ink">{label}</span>
      ) : null}
    </motion.div>
  );
}

export default Cursor;
