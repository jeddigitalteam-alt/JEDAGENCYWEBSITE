"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";
import { LabButton, LabControls, LabHint, LabSlider } from "./labs-kit";

const MAX = 22;
const REACH = 200; // px around the pointer that bends
const EASE = 0.15;

/**
 * Type lab. Type a phrase, drive four properties live, and drag across the
 * line to bend it locally — letters displace under the pointer and settle back
 * when it leaves.
 *
 * Size, tracking, slant and line height are ordinary React state: they change
 * when a human moves a slider, which is nowhere near frame rate. The bend is
 * the opposite — it runs every frame, so it writes `transform` straight onto
 * the letter spans and never touches state.
 *
 * Set in the site's display face. Only transforms move, so the line re-wraps
 * exactly as the browser laid it out.
 */
export function TypeLab() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const rafRef = useRef(0);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotionPref();

  const [text, setText] = useState("Everything fits somewhere");
  const [size, setSize] = useState(64);
  const [tracking, setTracking] = useState(-2);
  const [slant, setSlant] = useState(0);
  const [leading, setLeading] = useState(1);

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const line = lineRef.current;
    if (!wrap || !line) return;

    const state = new WeakMap<HTMLElement, { x: number; y: number }>();

    const loop = () => {
      const letters = line.querySelectorAll<HTMLElement>("[data-ch]");
      const p = pointerRef.current;
      const rect = wrap.getBoundingClientRect();
      for (const el of letters) {
        const s = state.get(el) ?? { x: 0, y: 0 };
        let tx = 0;
        let ty = 0;
        if (p) {
          const b = el.getBoundingClientRect();
          const cx = b.left + b.width / 2 - rect.left;
          const cy = b.top + b.height / 2 - rect.top;
          const dx = cx - p.x;
          const dy = cy - p.y;
          const d = Math.hypot(dx, dy);
          if (d < REACH && d > 0.01) {
            const f = (1 - d / REACH) ** 2;
            tx = (dx / d) * MAX * f;
            ty = (dy / d) * MAX * f * 0.6;
          }
        }
        s.x += (tx - s.x) * EASE;
        s.y += (ty - s.y) * EASE;
        state.set(el, s);
        el.style.transform =
          Math.abs(s.x) < 0.02 && Math.abs(s.y) < 0.02
            ? ""
            : `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointerRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => {
      pointerRef.current = null;
    };
    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointercancel", onLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointercancel", onLeave);
    };
  }, [reduced]);

  const words = text.length ? text.split(" ") : [" "];

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative grid min-h-[46svh] touch-pan-y place-items-center overflow-hidden rounded-2xl border border-rule bg-ink-raised px-5 py-16"
      >
        <p
          ref={lineRef}
          className="display select-none text-center"
          style={{
            fontSize: `clamp(1.75rem, ${size / 12}vw, ${size}px)`,
            letterSpacing: `${tracking / 100}em`,
            lineHeight: leading,
            fontStyle: slant > 0 ? "italic" : "normal",
            transform: slant > 0 ? `skewX(${-slant * 0.4}deg)` : undefined,
          }}
          aria-label={text}
        >
          {words.map((word, w) => (
            <span key={`${word}-${w}`} className="inline-block whitespace-nowrap">
              {[...word].map((ch, i) => (
                <span
                  key={`${ch}-${i}`}
                  data-ch=""
                  aria-hidden="true"
                  className="inline-block will-change-transform"
                >
                  {ch}
                </span>
              ))}
              {w < words.length - 1 ? <span aria-hidden="true">&nbsp;</span> : null}
            </span>
          ))}
        </p>
        <LabHint>
          {reduced
            ? "Controls live — pointer bending off for reduced motion"
            : "Drag across the line to bend it"}
        </LabHint>
      </div>

      <LabControls>
        <label className="flex min-w-[14rem] flex-1 flex-col gap-1.5">
          <span className="mono text-content-dim">Phrase</span>
          <input
            value={text}
            maxLength={40}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something"
            className="mono rounded-full border border-rule bg-transparent px-4 py-2.5 text-content outline-none transition-colors placeholder:text-content-dim focus-visible:border-blue"
          />
        </label>
        <LabSlider label="Size" value={size} min={28} max={140} onChange={setSize} suffix="px" />
        <LabSlider label="Tracking" value={tracking} min={-8} max={30} onChange={setTracking} />
        <LabSlider label="Slant" value={slant} min={0} max={10} onChange={setSlant} />
        <LabSlider label="Leading" value={leading} min={0.8} max={1.8} step={0.05} onChange={setLeading} />
        <LabButton
          onClick={() => {
            setSize(64);
            setTracking(-2);
            setSlant(0);
            setLeading(1);
          }}
        >
          Reset
        </LabButton>
      </LabControls>
    </div>
  );
}

export default TypeLab;
