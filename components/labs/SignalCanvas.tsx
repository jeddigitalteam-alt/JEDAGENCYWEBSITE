"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";
import {
  LAB,
  LabButton,
  LabControls,
  LabHint,
  LabModes,
  fitCanvas,
  useResize,
} from "./labs-kit";

const MODES = [
  { value: "line", label: "Continuous" },
  { value: "signal", label: "Segmented" },
  { value: "mirror", label: "Mirrored" },
] as const;
type Mode = (typeof MODES)[number]["value"];

/**
 * Signal canvas. Draw with a pointer or a finger; the stroke reads speed and
 * answers with weight.
 *
 * Not a paint app: a slow hand gives a heavy continuous contour, a fast one
 * thins and breaks into technical ticks. The segmented mode drops
 * perpendicular marks along the path like a plotted signal, and the mirrored
 * mode reflects every stroke across the centre line so a scribble becomes a
 * symmetrical study.
 *
 * Strokes are committed straight to the canvas as they happen, so there is no
 * retained scene and no animation loop — nothing runs when the pointer is
 * still. That is why this experiment costs nothing when idle.
 */
export function SignalCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const drawingRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });
  const modeRef = useRef<Mode>("line");
  const [mode, setMode] = useState<Mode>("line");
  const [dirty, setDirty] = useState(false);
  const reduced = useReducedMotionPref();


  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const { w, h } = sizeRef.current;
    if (!ctx || !w) return;
    ctx.clearRect(0, 0, w, h);
    // Faint centre line so mirrored mode reads as deliberate.
    ctx.save();
    ctx.setLineDash([2, 6]);
    ctx.strokeStyle = LAB.chalk;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.restore();
    setDirty(false);
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    sizeRef.current = fitCanvas(canvas, wrap);
    clear();
  }, [clear]);

  useResize(wrapRef, resize);
  useEffect(() => {
    resize();
  }, [resize]);

  const seg = (
    ctx: CanvasRenderingContext2D,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    speed: number,
  ) => {
    const m = modeRef.current;
    // Fast strokes thin out; slow strokes bear down.
    const width = Math.max(0.6, 7 - speed * 3.2);
    const alpha = Math.min(0.95, 0.35 + (7 - width) / 9);

    if (m === "signal") {
      // Perpendicular ticks along the segment — a plotted trace.
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const amp = Math.min(26, 4 + speed * 12);
      ctx.strokeStyle = LAB.blueSoft;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(ax - nx * amp, ay - ny * amp);
      ctx.lineTo(ax + nx * amp, ay + ny * amp);
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      return;
    }

    ctx.strokeStyle = speed > 1.6 ? LAB.coral : LAB.blue;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  };

  const stroke = (x: number, y: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    const last = lastRef.current;
    if (!ctx || !last) return;
    const dt = Math.max(1, performance.now() - last.t);
    const speed = Math.hypot(x - last.x, y - last.y) / dt; // px per ms
    const { w } = sizeRef.current;

    ctx.save();
    seg(ctx, last.x, last.y, x, y, speed);
    if (modeRef.current === "mirror") {
      seg(ctx, w - last.x, last.y, w - x, y, speed);
    }
    ctx.restore();
    lastRef.current = { x, y, t: performance.now() };
    if (!dirty) setDirty(true);
  };

  const local = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <div>
      <div
        ref={wrapRef}
        /* touch-none only while drawing is impossible to express in CSS, so the
           canvas claims the pointer on down instead; the wrapper keeps pan-y so
           a finger that starts outside still scrolls the page. */
        className="relative h-[58svh] touch-pan-y overflow-hidden rounded-2xl border border-rule bg-ink-raised"
      >
        <canvas
          ref={canvasRef}
          className={reduced ? "block" : "block cursor-crosshair touch-none"}
          role="img"
          aria-label="Drawing surface — drag to draw; stroke weight follows your speed"
          onPointerDown={(e) => {
            if (reduced) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drawingRef.current = true;
            const { x, y } = local(e);
            lastRef.current = { x, y, t: performance.now() };
          }}
          onPointerMove={(e) => {
            if (!drawingRef.current) return;
            const { x, y } = local(e);
            stroke(x, y);
          }}
          onPointerUp={(e) => {
            drawingRef.current = false;
            lastRef.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            drawingRef.current = false;
            lastRef.current = null;
          }}
        />
        <LabHint>
          {reduced
            ? "Drawing disabled — motion reduced"
            : "Drag to draw — move faster for a thinner, broken line"}
        </LabHint>
      </div>

      <LabControls>
        <LabModes label="Stroke mode" options={MODES} value={mode} onChange={setMode} />
        <div className="flex-1" />
        <LabButton onClick={clear} disabled={!dirty}>
          Clear
        </LabButton>
      </LabControls>
    </div>
  );
}

export default SignalCanvas;
