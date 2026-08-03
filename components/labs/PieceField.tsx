"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";

const GAP = 74; // grid pitch in px
const SIZE = 44; // piece size in px
const REACH = 170; // cursor influence radius
const PUSH = 16; // furthest a piece is displaced
const EASE = 0.12; // approach rate per frame

/**
 * Piece field. A lattice of puzzle outlines that lean away from the cursor and
 * settle back when it leaves.
 *
 * Deliberately restrained: displacement caps at PUSH px and rotation at a few
 * degrees, so the grid reads as a surface under tension rather than a toy.
 *
 * The whole thing runs on one rAF loop writing to a canvas. Pointer position
 * lives in a ref, never in state, so no frame causes a React render. Under
 * reduced motion it draws the lattice once and never starts the loop.
 */
export function PieceField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotionPref();

  /** One outline: a square with a knob right, socket left — the site's motif. */
  const drawPiece = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    alpha: number,
  ) => {
    const h = SIZE / 2;
    const k = SIZE * 0.19;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-h, -h);
    ctx.lineTo(h, -h);
    ctx.lineTo(h, -k);
    ctx.arc(h, 0, k, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(h, h);
    ctx.lineTo(-h, h);
    ctx.lineTo(-h, k);
    ctx.arc(-h, 0, k, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.strokeStyle = "#38B6FF";
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.restore();
  };

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

    type Cell = { hx: number; hy: number; dx: number; dy: number; rot: number };
    let cells: Cell[] = [];
    const build = () => {
      cells = [];
      const cols = Math.ceil(w / GAP) + 1;
      const rows = Math.ceil(h / GAP) + 1;
      const offX = (w - (cols - 1) * GAP) / 2;
      const offY = (h - (rows - 1) * GAP) / 2;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          cells.push({ hx: offX + c * GAP, hy: offY + r * GAP, dx: 0, dy: 0, rot: 0 });
    };
    build();

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      for (const cell of cells) {
        drawPiece(
          ctx,
          cell.hx + cell.dx,
          cell.hy + cell.dy,
          cell.rot,
          0.2 + Math.min(1, Math.hypot(cell.dx, cell.dy) / PUSH) * 0.55,
        );
      }
    };

    if (reduced) {
      paint();
      const onResizeStatic = () => {
        ({ w, h } = sizeCanvas());
        build();
        paint();
      };
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    const loop = () => {
      const p = pointer.current;
      for (const cell of cells) {
        let tx = 0;
        let ty = 0;
        let trot = 0;
        if (p) {
          const vx = cell.hx - p.x;
          const vy = cell.hy - p.y;
          const dist = Math.hypot(vx, vy);
          if (dist < REACH && dist > 0.001) {
            // Smooth falloff — squared so the effect fades out rather than edges out.
            const f = (1 - dist / REACH) ** 2;
            tx = (vx / dist) * PUSH * f;
            ty = (vy / dist) * PUSH * f;
            trot = f * 0.22;
          }
        }
        cell.dx += (tx - cell.dx) * EASE;
        cell.dy += (ty - cell.dy) * EASE;
        cell.rot += (trot - cell.rot) * EASE;
      }
      paint();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const wrap = wrapRef.current;
    const onMove = (e: PointerEvent) => {
      const rect = wrap?.getBoundingClientRect();
      if (!rect) return;
      pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      pointer.current = null;
    };
    const onResize = () => {
      ({ w, h } = sizeCanvas());
      build();
    };

    wrap?.addEventListener("pointermove", onMove, { passive: true });
    wrap?.addEventListener("pointerleave", onLeave);
    wrap?.addEventListener("pointercancel", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      wrap?.removeEventListener("pointermove", onMove);
      wrap?.removeEventListener("pointerleave", onLeave);
      wrap?.removeEventListener("pointercancel", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [sizeCanvas, reduced]);

  return (
    <div
      ref={wrapRef}
      /* touch-action keeps vertical scrolling with the finger: a drag over the
         field pans the page rather than being swallowed by the effect. */
      className="relative h-[52svh] touch-pan-y overflow-hidden rounded-2xl border border-rule bg-ink-raised"
    >
      <canvas
        ref={canvasRef}
        className="block"
        role="img"
        aria-label="A lattice of puzzle outlines that lean away from the pointer"
      />
      <p className="mono pointer-events-none absolute bottom-4 left-4 text-content-dim">
        {reduced ? "Static lattice — motion reduced" : "Move the pointer across the field"}
      </p>
    </div>
  );
}

export default PieceField;
