"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";
import { LAB, fitCanvas, useNearViewport, useResize } from "./labs-kit";

/** Target layout, in a 10x6 unit grid: an interlocking block that resolves. */
const TARGET: [number, number][] = [
  [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
  [2, 3], [3, 3], [6, 3], [7, 3],
  [3, 1], [6, 4],
];

/**
 * Scroll assembly. Twelve fragments start scattered and rotated; scrolling the
 * section drives them into one resolved block, and scrolling back takes them
 * apart again.
 *
 * Progress is read from the section's own rect every frame, so the state is a
 * pure function of scroll position — there is no "played" flag and no
 * one-way trigger, which is what makes reversing exact rather than replayed.
 *
 * The sticky stage is one viewport tall inside a section twice that, so the
 * whole sequence costs a single screen of extra scrolling.
 */
export function ScrollAssembly() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const drawRef = useRef<(t: number) => void>(() => {});
  const progressRef = useRef(0);
  const [pct, setPct] = useState(0);
  const reduced = useReducedMotionPref();
  // Nothing here needs to run while the section is nowhere near the viewport.
  // Without this the loop measured the section and repainted every frame for
  // the whole life of the page, including a forced layout per frame from
  // getBoundingClientRect — competing with the smooth-scroll runner, which
  // drives scrolling from its own rAF.
  const near = useNearViewport(sectionRef);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    sizeRef.current = fitCanvas(canvas, stage);
    // A resize clears the canvas; redraw at wherever the scroll currently is.
    drawRef.current(progressRef.current);
  }, []);

  useResize(stageRef, resize);

  useEffect(() => {
    resize();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Scatter is deterministic, so the same fragment always starts in the same
    // place — the sequence is repeatable, not random on every mount.
    const scatter = TARGET.map((_, i) => {
      const a = (i * 2.399963) % (Math.PI * 2);
      // Radius stays under half the stage so every fragment is on screen at 0% —
      // the section should read as parts gathering, not as an empty frame.
      return { a, r: 0.22 + ((i * 37) % 21) / 100, rot: ((i % 5) - 2) * 0.7 };
    });

    const draw = (t: number) => {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;
      const unit = Math.min(w / 13, h / 8);
      const gx = (w - unit * 10) / 2;
      const gy = (h - unit * 6) / 2;
      // Ease so the middle of the scroll does most of the work.
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

      ctx.clearRect(0, 0, w, h);

      TARGET.forEach(([col, row], i) => {
        const hx = gx + col * unit;
        const hy = gy + row * unit;
        const s = scatter[i];
        const sxp = w / 2 + Math.cos(s.a) * w * s.r - unit / 2;
        const syp = h / 2 + Math.sin(s.a) * h * s.r - unit / 2;
        const x = sxp + (hx - sxp) * e;
        const y = syp + (hy - syp) * e;
        const rot = s.rot * (1 - e);

        ctx.save();
        ctx.translate(x + unit / 2, y + unit / 2);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.roundRect(-unit / 2, -unit / 2, unit, unit, unit * 0.16);
        ctx.fillStyle = LAB.blue;
        ctx.globalAlpha = 0.08 + e * 0.16;
        ctx.fill();
        ctx.globalAlpha = 0.25 + e * 0.6;
        ctx.strokeStyle = i % 6 === 2 ? LAB.coral : LAB.blueSoft;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      });

      // The seam closes only at the very end.
      if (e > 0.86) {
        const k = (e - 0.86) / 0.14;
        ctx.save();
        ctx.globalAlpha = k * 0.85;
        ctx.strokeStyle = LAB.coral;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        // Along the block's own horizontal joint (between rows 2 and 3), not
        // floating below it.
        ctx.moveTo(gx + unit * 2, gy + unit * 3);
        ctx.lineTo(gx + unit * 8, gy + unit * 3);
        ctx.stroke();
        ctx.restore();
      }
    };

    drawRef.current = draw;

    if (reduced) {
      progressRef.current = 1;
      // Rendered fully assembled; the readout is derived below rather than set
      // here, so no state is written from inside this effect.
      draw(1);
      return;
    }

    // The observer carries a 300px margin, so the loop is always already
    // running before any part of the stage can be seen.
    if (!near) return;

    let lastPct = -1;
    const loop = () => {
      const section = sectionRef.current;
      if (section) {
        const r = section.getBoundingClientRect();
        // 0 when the section's top reaches the top of the viewport, 1 when its
        // bottom does — exactly the span the sticky stage is pinned for.
        const travel = r.height - window.innerHeight;
        const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
        progressRef.current = p;
        draw(p);
        const rounded = Math.round(p * 100);
        if (rounded !== lastPct) {
          lastPct = rounded;
          setPct(rounded);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduced, resize, near]);

  return (
    // Two viewports tall: one to pin, one to scrub through.
    <div ref={sectionRef} className="relative h-[200svh]">
      <div
        ref={stageRef}
        className="sticky top-0 h-svh overflow-hidden border-y border-rule bg-ink-raised"
      >
        <canvas
          ref={canvasRef}
          className="block"
          role="img"
          aria-label="Fragments that assemble into one block as the section is scrolled"
        />
        <p className="mono pointer-events-none absolute bottom-6 left-5 text-content-dim md:left-8">
          {reduced
            ? "Shown assembled — motion reduced"
            : pct >= 99
              ? "Assembled — scroll back to take it apart"
              : "Keep scrolling to assemble"}
        </p>
        <p className="mono pointer-events-none absolute bottom-6 right-5 tabular-nums text-content-dim md:right-8">
          {String(reduced ? 100 : pct).padStart(3, "0")}%
        </p>
      </div>
    </div>
  );
}

export default ScrollAssembly;
