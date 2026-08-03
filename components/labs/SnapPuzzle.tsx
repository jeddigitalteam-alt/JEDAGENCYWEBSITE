"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";
import {
  LAB,
  LabButton,
  LabControls,
  LabHint,
  fitCanvas,
  useNearViewport,
  useResize,
} from "./labs-kit";

/** Board authored in a 6x3 unit grid, scaled to whatever width we are given. */
const COLS = 6;
const ROWS = 3;
/** The slots to fill. Reads as an interlocking block rather than a letter. */
const SLOTS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [2, 1],
  [3, 1],
  [3, 2],
  [4, 1],
  [5, 1],
];
/** Snap radius as a fraction of a tile, so it stays forgiving on a phone
 *  canvas and proportionate on a wide one rather than a fixed pixel count. */
const SNAP_RATIO = 0.55;

type Piece = {
  id: number;
  x: number; // current top-left, px
  y: number;
  slot: number | null; // index into SLOTS once seated
};

/**
 * Snap-together. Eight tiles start scattered; drag each into an outline and it
 * pulls in and locks. Fill all eight and the mark resolves.
 *
 * The tiles are identical, so any tile may take any free slot — tying each one
 * to a private target would be arbitrary and would make the puzzle feel broken
 * rather than solved. On release the nearest unoccupied slot within range wins.
 *
 * Hit-testing and dragging are plain pointer events on one canvas: the whole
 * interaction is "is this point inside that square". Pointer capture means a
 * fast drag cannot outrun the element, and mouse, pen and touch share the path.
 * Positions live in a ref; only the seated count reaches React.
 */
export function SnapPuzzle() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<Piece[]>([]);
  const dragRef = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, unit: 0, offX: 0, offY: 0 });
  const paintRef = useRef<() => void>(() => {});
  const rafRef = useRef(0);
  const [seated, setSeated] = useState(0);
  const [round, setRound] = useState(0);
  const reduced = useReducedMotionPref();
  /* Read by the paint loop. Held in a ref rather than an effect dependency
     because re-running that effect calls layout(true), which would rescatter
     the tiles every time the section left and re-entered the viewport. */
  const near = useNearViewport(wrapRef);
  const nearRef = useRef(near);
  useEffect(() => {
    nearRef.current = near;
  }, [near]);

  const slotXY = (i: number) => {
    const { unit, offX, offY } = sizeRef.current;
    const [col, row] = SLOTS[i];
    return { x: offX + col * unit, y: offY + row * unit };
  };

  /** Recompute geometry. `scatter` reseeds positions; otherwise it keeps them. */
  const layout = useCallback((scatter: boolean) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const { w, h } = fitCanvas(canvas, wrap);
    const unit = Math.min((w * 0.62) / COLS, (h * 0.52) / ROWS);
    sizeRef.current = {
      w,
      h,
      unit,
      offX: (w - unit * COLS) / 2,
      offY: (h - unit * ROWS) / 2,
    };

    if (scatter || piecesRef.current.length !== SLOTS.length) {
      const pad = unit * 0.3;
      piecesRef.current = SLOTS.map((_, i) => {
        const edge = i % 4;
        const rx = pad + Math.random() * Math.max(1, w - unit - pad * 2);
        const ry = pad + Math.random() * Math.max(1, h - unit - pad * 2);
        return {
          id: i,
          x: edge === 0 ? pad : edge === 1 ? w - unit - pad : rx,
          y: edge === 2 ? pad : edge === 3 ? h - unit - pad : ry,
          slot: null,
        };
      });
    } else {
      // Keep seated tiles glued to their slot as it moves.
      piecesRef.current = piecesRef.current.map((p) =>
        p.slot == null ? p : { ...p, ...slotXY(p.slot) },
      );
    }
    paintRef.current();
  }, []);

  // Any resize both re-lays out and repaints — resizing a canvas clears it, and
  // under reduced motion there is no loop that would draw it again.
  useResize(wrapRef, () => layout(false));

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const tile = (p: Piece, done: boolean) => {
      const { unit } = sizeRef.current;
      const on = p.slot != null;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, unit, unit, unit * 0.14);
      ctx.fillStyle = on ? LAB.blue : LAB.blueSoft;
      ctx.globalAlpha = on ? (done ? 0.32 : 0.22) : 0.1;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = on ? LAB.blue : LAB.blueSoft;
      ctx.lineWidth = on ? 1.6 : 1.2;
      ctx.stroke();
      // Knob and socket, so the tiles read as puzzle parts rather than squares.
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(p.x + unit, p.y + unit / 2, unit * 0.13, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y + unit / 2, unit * 0.13, Math.PI / 2, -Math.PI / 2, true);
      ctx.stroke();
      ctx.restore();
    };

    const paint = () => {
      const { w, h, unit, offX, offY } = sizeRef.current;
      if (!w || !h || !unit) return;
      ctx.clearRect(0, 0, w, h);
      const all = piecesRef.current;
      const taken = new Set(all.map((p) => p.slot).filter((s) => s != null));
      const done = taken.size === SLOTS.length;

      // Ghost outlines for the slots still open.
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = LAB.chalk;
      ctx.globalAlpha = 0.18;
      SLOTS.forEach(([col, row], i) => {
        if (taken.has(i)) return;
        ctx.beginPath();
        ctx.roundRect(offX + col * unit, offY + row * unit, unit, unit, unit * 0.14);
        ctx.stroke();
      });
      ctx.restore();

      for (const p of all) tile(p, done);

      if (done) {
        ctx.save();
        ctx.strokeStyle = LAB.coral;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(
          offX - unit * 0.2,
          offY - unit * 0.2,
          unit * COLS + unit * 0.4,
          unit * ROWS + unit * 0.4,
          unit * 0.22,
        );
        ctx.stroke();
        ctx.restore();
      }
    };
    paintRef.current = paint;

    // First layout for this round. Reduced motion opens already solved.
    layout(true);
    if (reduced) {
      piecesRef.current = piecesRef.current.map((p, i) => ({
        ...p,
        ...slotXY(i),
        slot: i,
      }));
      paint();
      return;
    }

    const loop = () => {
      if (nearRef.current) paint();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduced, round, layout]);

  const snapRadius = () => sizeRef.current.unit * SNAP_RATIO;

  /** Nearest free slot to a tile's current corner, or null. */
  const nearestFree = (p: Piece) => {
    const taken = new Set(
      piecesRef.current.filter((q) => q.id !== p.id).map((q) => q.slot),
    );
    let best: { i: number; d: number } | null = null;
    for (let i = 0; i < SLOTS.length; i++) {
      if (taken.has(i)) continue;
      const { x, y } = slotXY(i);
      const d = Math.hypot(p.x - x, p.y - y);
      if (!best || d < best.d) best = { i, d };
    }
    return best;
  };

  const local = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (reduced) return;
    const { x, y } = local(e);
    const { unit } = sizeRef.current;
    const all = piecesRef.current;
    for (let i = all.length - 1; i >= 0; i--) {
      const p = all[i];
      if (x >= p.x && x <= p.x + unit && y >= p.y && y <= p.y + unit) {
        e.currentTarget.setPointerCapture(e.pointerId);
        // Lifting a seated tile frees its slot again.
        p.slot = null;
        setSeated(piecesRef.current.filter((q) => q.slot != null).length);
        dragRef.current = { id: p.id, dx: x - p.x, dy: y - p.y };
        piecesRef.current = [...all.filter((q) => q.id !== p.id), p];
        return;
      }
    }
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const { x, y } = local(e);
    const { unit, w, h } = sizeRef.current;
    const p = piecesRef.current.find((q) => q.id === d.id);
    if (!p) return;
    p.x = Math.max(0, Math.min(w - unit, x - d.dx));
    p.y = Math.max(0, Math.min(h - unit, y - d.dy));
    // Live magnet preview so the snap is felt before release.
    const near = nearestFree(p);
    if (near && near.d < snapRadius()) {
      const t = slotXY(near.i);
      p.x += (t.x - p.x) * 0.4;
      p.y += (t.y - p.y) * 0.4;
    }
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    const p = piecesRef.current.find((q) => q.id === d.id);
    if (!p) return;
    const near = nearestFree(p);
    if (near && near.d < snapRadius()) {
      const t = slotXY(near.i);
      p.x = t.x;
      p.y = t.y;
      p.slot = near.i;
    }
    setSeated(piecesRef.current.filter((q) => q.slot != null).length);
  };

  const shown = reduced ? SLOTS.length : seated;
  const solved = shown === SLOTS.length;

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative h-[62svh] touch-pan-y overflow-hidden rounded-2xl border border-rule bg-ink-raised"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={
            reduced ? "block" : "block cursor-grab touch-none active:cursor-grabbing"
          }
          role="img"
          aria-label="Drag the eight tiles into the dashed outlines to complete the mark"
        />
        <LabHint>
          {reduced
            ? "Shown solved — motion reduced"
            : solved
              ? "Complete — every slot filled"
              : "Drag a tile onto any dashed outline; it snaps when close"}
        </LabHint>
      </div>

      <LabControls>
        <span className="mono tabular-nums text-content-dim">
          {String(shown).padStart(2, "0")} / {String(SLOTS.length).padStart(2, "0")} seated
        </span>
        <div className="flex-1" />
        <LabButton onClick={() => setRound((r) => r + 1)} disabled={reduced}>
          Scatter again
        </LabButton>
      </LabControls>
    </div>
  );
}

export default SnapPuzzle;
