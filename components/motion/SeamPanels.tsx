"use client";

import { motion } from "motion/react";
import { SEAM_ANGLE_DEG } from "@/components/brand/puzzle-paths";

/**
 * Two ink panels that meet along the mark's 45° seam and slide apart
 * perpendicular to it.
 *
 * Implemented as an oversized wrapper rotated to the seam angle, holding two
 * stacked halves. Their shared edge IS the seam, so separating them along the
 * rotated Y axis is exactly the seam normal — no per-viewport clip-path maths,
 * and it stays correct at any aspect ratio from 360px to 2560px.
 *
 * Used twice: the intro loader's reveal, and the compressed route transition.
 */
export function SeamPanels({
  open,
  duration = 0.45,
  className = "",
}: {
  /** `false` = covering the viewport, `true` = split apart. */
  open: boolean;
  duration?: number;
  className?: string;
}) {
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: "300vmax",
          height: "300vmax",
          transform: `translate(-50%, -50%) rotate(${SEAM_ANGLE_DEG}deg)`,
        }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2 bg-ink"
          initial={false}
          animate={{ y: open ? "-100%" : "0%" }}
          transition={{ duration, ease }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
          initial={false}
          animate={{ y: open ? "100%" : "0%" }}
          transition={{ duration, ease }}
        />
      </div>
    </div>
  );
}

export default SeamPanels;
