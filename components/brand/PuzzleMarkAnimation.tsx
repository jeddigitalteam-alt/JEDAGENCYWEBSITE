"use client";

import { motion } from "motion/react";
import {
  LOADER_PIECE_A,
  LOADER_PIECE_B,
  LOADER_PIECE_OFFSETS,
  LOADER_VIEWBOX,
} from "@/components/brand/puzzle-loader-paths";

/**
 * ============================================================================
 *  The two pieces, apart or locked. The site's one connect animation.
 * ============================================================================
 *
 * Extracted from IntroLoader so the route transition can play the same gesture
 * rather than carry a second copy of it. The loader's rendered output is
 * unchanged by the extraction — same markup, same attributes, same offsets,
 * same curve — and it stays the only caller that draws the outlines on.
 *
 * **The artwork is still frozen.** This component owns the geometry import so
 * that the two places it appears cannot drift apart, but the rule in
 * ./puzzle-loader-paths has not moved: the pieces here are a copy taken before
 * the site logo was rebuilt, they lock edge to edge, and editing the site logo
 * must have zero effect on either caller. Stroke-only outlines — never the site
 * logo's blue fill and white keyline.
 *
 * What varies between the two callers is the *staging*, not the motion:
 *
 * | | intro loader | route transition |
 * |---|---|---|
 * | size | `min(52vw,30rem)` | 5.25rem / 6rem |
 * | outlines | stroke-drawn first | already drawn |
 * | separation | 1x | 2.2x, so the travel still reads at a tenth the size |
 * | ends | locked, then the panels part | locked, then parts again as the page opens |
 */

/** The loader's lock: 500ms on the site's expo-out. Its default here too. */
export const MARK_LOCK_DUR = 0.5;

/**
 * Monotonic close along the seam normal, no overshoot — every control point is
 * inside [0,1], so the pieces cannot cross the seam and settle back.
 */
export const MARK_EASE_LOCK = [0.16, 1, 0.3, 1] as const;

export interface PuzzleMarkAnimationProps {
  /** Pieces travel to their seated position when true, apart when false. */
  locked: boolean;
  /**
   * Multiplier on the pre-lock separation. 1 is the loader's own 90 viewBox
   * units along the normal. A mark rendered small needs more, because the
   * separation scales with the mark and 90 units of a 96px mark is 6px.
   */
  separation?: number;
  /** Seconds of travel. */
  duration?: number;
  /** Seconds before the travel starts. */
  delay?: number;
  /**
   * Stroke-draw the outlines as they arrive — the loader's opening beat, and
   * only the loader's: by the time a visitor is changing routes they have seen
   * the mark drawn, and drawing it again is a beat the transition has no room
   * for.
   */
  draw?: { duration: number; stagger: number } | false;
  /** No travel and no draw: the mark simply exists, seated. */
  reduced?: boolean;
  /** Sizing and colour. The stroke reads `currentColor`. */
  className?: string;
  /**
   * In viewBox units. 7 is the loader's, which at 480px renders about 3.4px.
   * A small instance needs more to hold the same presence.
   */
  strokeWidth?: number;
  /** Accessible name. Omit for decorative instances. */
  title?: string;
}

export function PuzzleMarkAnimation({
  locked,
  separation = 1,
  duration = MARK_LOCK_DUR,
  delay = 0,
  draw = false,
  reduced = false,
  className,
  strokeWidth = 7,
  title,
}: PuzzleMarkAnimationProps) {
  const apart = (i: number) => ({
    x: LOADER_PIECE_OFFSETS[i].x * separation,
    y: LOADER_PIECE_OFFSETS[i].y * separation,
  });

  return (
    <svg
      viewBox={LOADER_VIEWBOX}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(title
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": true, focusable: "false" })}
    >
      {[LOADER_PIECE_A, LOADER_PIECE_B].map((d, i) => (
        <motion.g
          key={i}
          /* Only transform and opacity animate here, so declaring it lets the
             compositor hold the pieces on their own layers instead of
             re-rasterising them behind main-thread work. */
          style={{ willChange: "transform" }}
          initial={reduced ? false : apart(i)}
          animate={locked ? { x: 0, y: 0 } : apart(i)}
          transition={{
            duration: reduced ? 0 : duration,
            delay: reduced ? 0 : delay,
            ease: MARK_EASE_LOCK,
          }}
        >
          {draw ? (
            <motion.path
              d={d}
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reduced ? 0 : draw.duration,
                delay: reduced ? 0 : i * draw.stagger,
                ease: "easeInOut",
              }}
            />
          ) : (
            <path d={d} />
          )}
        </motion.g>
      ))}
    </svg>
  );
}

export default PuzzleMarkAnimation;
