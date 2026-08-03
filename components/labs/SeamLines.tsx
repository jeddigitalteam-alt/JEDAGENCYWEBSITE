"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";

const LINES = 26;
const ANGLE = Math.PI / 4; // the site's 45° seam

/**
 * Seam lines. The 45° interlock angle the rest of the site is built on, drawn
 * as a rule system that opens and closes as the section passes the viewport.
 *
 * Scroll-driven rather than pointer-driven, so it behaves identically on a
 * phone — the input is the same gesture people are already making. Progress is
 * read from the element's own rect inside the rAF loop rather than from a
 * scroll listener, so there is nothing to throttle and no state to update.
 *
 * Under reduced motion it renders once at the midpoint of the sequence.
 */
export function SeamLines() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const reduced = useReducedMotionPref();

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return { w: 0, h: 0 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }, []);

  useEffect(() => {
    let { w, h } = sizeCanvas();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !w || !h) return;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const diag = Math.hypot(w, h);
      const spacing = diag / LINES;
      const dx = Math.cos(ANGLE);
      const dy = Math.sin(ANGLE);

      for (let i = 0; i < LINES; i++) {
        // Each line joins the sequence slightly after the one before it, so the
        // system unzips along the seam instead of fading in as a block.
        const stagger = i / LINES;
        const local = Math.min(1, Math.max(0, (t - stagger * 0.45) / 0.55));
        if (local <= 0) continue;

        // Anchor point marching along the perpendicular.
        const off = (i + 0.5) * spacing - diag / 2;
        const ax = w / 2 - dy * off;
        const ay = h / 2 + dx * off;

        // Half-length grows with progress; the gap at the centre closes last.
        const half = (diag / 2) * local;
        const gap = (1 - local) * spacing * 1.4;

        ctx.strokeStyle = i % 7 === 3 ? "#FF9B79" : "#38B6FF";
        ctx.globalAlpha = i % 7 === 3 ? 0.34 * local : 0.16 + 0.22 * local;
        ctx.lineWidth = i % 7 === 3 ? 1.4 : 1;

        ctx.beginPath();
        ctx.moveTo(ax - dx * half, ay - dy * half);
        ctx.lineTo(ax - dx * gap, ay - dy * gap);
        ctx.moveTo(ax + dx * gap, ay + dy * gap);
        ctx.lineTo(ax + dx * half, ay + dy * half);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      draw(0.55);
      const onResizeStatic = () => {
        ({ w, h } = sizeCanvas());
        draw(0.55);
      };
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    const loop = () => {
      const wrap = wrapRef.current;
      if (wrap) {
        const r = wrap.getBoundingClientRect();
        // 0 as the panel enters from below, 1 once it has risen past the top.
        const span = window.innerHeight + r.height;
        const p = 1 - (r.top + r.height) / span;
        draw(Math.min(1, Math.max(0, p)));
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      ({ w, h } = sizeCanvas());
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [sizeCanvas, reduced]);

  return (
    <div
      ref={wrapRef}
      className="relative h-[60svh] overflow-hidden rounded-2xl border border-rule bg-ink-raised"
    >
      <canvas
        ref={canvasRef}
        className="block"
        role="img"
        aria-label="A system of 45° rules that opens as the section is scrolled"
      />
      <p className="mono pointer-events-none absolute bottom-4 left-4 text-content-dim">
        {reduced ? "Fixed state — motion reduced" : "Scroll to drive the system"}
      </p>
    </div>
  );
}

export default SeamLines;
