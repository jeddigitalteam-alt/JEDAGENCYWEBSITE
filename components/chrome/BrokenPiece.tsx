"use client";

import { motion, useMotionValue, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { PIECE_A, PIECE_B, VIEWBOX } from "@/components/brand/puzzle-paths";

const SNAP_DISTANCE = 56;

/**
 * The 404 toy: one piece has come loose. Drag it back into the notch and it
 * snaps home.
 *
 * Reduced-motion and keyboard users get a working "Put it back" button, so the
 * page never depends on a drag gesture to be usable.
 */
export function BrokenPiece() {
  const reduced = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const [seated, setSeated] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const seat = () => {
    x.set(0);
    y.set(0);
    setSeated(true);
  };

  return (
    <div className="mt-12">
      <div
        ref={boardRef}
        className="relative grid h-64 place-items-center rounded-2xl border border-rule bg-ink-raised"
      >
        <svg
          viewBox={VIEWBOX}
          className="h-40 w-40 text-blue"
          fill="none"
          stroke="currentColor"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* The seated half stays put. */}
          <path d={PIECE_B} opacity={0.28} />
          <motion.g
            style={{ x, y }}
            drag={!reduced}
            dragMomentum={false}
            dragElastic={0.12}
            onDragEnd={() => {
              const dist = Math.hypot(x.get(), y.get());
              if (dist < SNAP_DISTANCE) seat();
              else setSeated(false);
            }}
            animate={seated ? { x: 0, y: 0 } : undefined}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={reduced ? undefined : "cursor-grab active:cursor-grabbing"}
          >
            <path d={PIECE_A} />
          </motion.g>
        </svg>

        <p className="mono absolute bottom-4 left-4 text-content-dim">
          {seated ? "Seated — 1 / 1" : reduced ? "1 piece loose" : "Drag to seat — 0 / 1"}
        </p>

        {(!seated || reduced) && (
          <button
            onClick={seat}
            className="mono absolute bottom-4 right-4 rounded-full border border-rule px-4 py-2 transition-colors hover:border-blue hover:text-blue"
          >
            Put it back
          </button>
        )}
      </div>

      <nav aria-label="Suggested pages" className="mt-8 flex flex-wrap gap-3">
        {[
          ["Home", "/"],
          ["Work", "/work"],
          ["Services", "/services"],
          ["Contact", "/contact"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="mono rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default BrokenPiece;
