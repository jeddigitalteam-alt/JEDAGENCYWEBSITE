"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";

const PHRASE = "Everything fits somewhere";
const REACH = 190; // px from the pointer at which a letter starts to respond
const LIFT = 16; // furthest a letter rises
const SPREAD = 7; // furthest a letter slides sideways
const EASE = 0.16;

/**
 * Type splice. The phrase stays set in the display face and stays readable —
 * letters near the pointer lift and open up their spacing, then close again.
 *
 * Letters are laid out once as spans and then mutated directly: the loop writes
 * `style.transform` on DOM nodes rather than going through state, so a 60fps
 * effect costs zero React renders. Only transforms are touched, so nothing
 * reflows and the line never rewraps.
 *
 * The readable phrase is exposed once on the wrapper for assistive tech and the
 * per-letter spans are hidden from it, so this reads as one string, not
 * twenty-five.
 */
export function TypeSplice() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const letters = Array.from(
      wrap.querySelectorAll<HTMLSpanElement>("[data-letter]"),
    );
    if (!letters.length) return;

    const state = letters.map(() => ({ y: 0, x: 0 }));
    let pointer: { x: number; y: number } | null = null;

    const loop = () => {
      const rect = wrap.getBoundingClientRect();
      for (let i = 0; i < letters.length; i++) {
        const el = letters[i];
        const s = state[i];
        let ty = 0;
        let tx = 0;
        if (pointer) {
          const b = el.getBoundingClientRect();
          const cx = b.left + b.width / 2 - rect.left;
          const cy = b.top + b.height / 2 - rect.top;
          const d = Math.hypot(cx - pointer.x, cy - pointer.y);
          if (d < REACH) {
            const f = (1 - d / REACH) ** 2;
            ty = -LIFT * f;
            tx = Math.sign(cx - pointer.x) * SPREAD * f;
          }
        }
        s.y += (ty - s.y) * EASE;
        s.x += (tx - s.x) * EASE;
        el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      pointer = null;
    };
    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointercancel", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointercancel", onLeave);
      for (const el of letters) el.style.transform = "";
    };
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      className="relative grid h-[52svh] touch-pan-y place-items-center overflow-hidden rounded-2xl border border-rule bg-ink-raised px-5"
    >
      <p
        className="display select-none text-center text-step-4 leading-[1.05]"
        aria-label={PHRASE}
      >
        {PHRASE.split(" ").map((word, w) => (
          // Words never break: the wrapper is inline-block, so a lifted letter
          // cannot drag a line break with it.
          <span key={`${word}-${w}`} className="inline-block whitespace-nowrap">
            {word.split("").map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                data-letter=""
                aria-hidden="true"
                className="inline-block will-change-transform"
              >
                {ch}
              </span>
            ))}
            {w < PHRASE.split(" ").length - 1 ? (
              <span aria-hidden="true">&nbsp;</span>
            ) : null}
          </span>
        ))}
      </p>
      <p className="mono pointer-events-none absolute bottom-4 left-4 text-content-dim">
        {reduced ? "Static setting — motion reduced" : "Trace the line with the pointer"}
      </p>
    </div>
  );
}

export default TypeSplice;
