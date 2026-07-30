"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * Scroll-progress indicator — the seam again, this time as a fill.
 * `scaleX` keeps it off the layout thread; `transform-origin: left` makes it
 * read as a line filling rather than a box growing from the centre.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent"
      aria-hidden="true"
    >
      <motion.div
        className="h-full origin-left bg-blue"
        style={{ scaleX: width }}
      />
    </div>
  );
}

export default ReadingProgress;
