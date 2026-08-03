"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";
import {
  LAB,
  LabButton,
  LabControls,
  LabHint,
  LabSlider,
  fitCanvas,
  useNearViewport,
  useResize,
} from "./labs-kit";

type Node = { x: number; y: number; vx: number; vy: number; held: boolean };

/** Node count scales with the surface, so the field reads as a network on a
 *  wide screen instead of a handful of dots, and stays legible on a phone. */
const startCount = (w: number, h: number) =>
  Math.round(Math.min(64, Math.max(18, (w * h) / 15000)));

/**
 * Node field. Drag the nodes, click empty space to add one, and set how far a
 * connection can reach.
 *
 * Links are recomputed from distance every frame, so the network is a
 * consequence of where things are rather than a stored graph — move one node
 * and the structure around it reorganises. Nodes carry light damping so a
 * thrown node drifts to a stop instead of stopping dead, and they repel at
 * very close range so the field settles rather than clumping.
 *
 * The loop is gated on visibility; positions live in a ref so dragging never
 * re-renders React.
 */
export function NodeField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const dragRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef(0);
  const paintRef = useRef<() => void>(() => {});
  const reachRef = useRef(215);
  const [reach, setReach] = useState(215);
  const [count, setCount] = useState(0);
  const reduced = useReducedMotionPref();
  const near = useNearViewport(wrapRef);


  useEffect(() => {
    reachRef.current = reach;
  }, [reach]);

  const seed = useCallback(() => {
    const { w, h } = sizeRef.current;
    if (!w) return;
    nodesRef.current = Array.from({ length: startCount(w, h) }, () => ({
      x: w * (0.04 + Math.random() * 0.92),
      y: h * (0.07 + Math.random() * 0.86),
      vx: 0,
      vy: 0,
      held: false,
    }));
    setCount(nodesRef.current.length);
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const prev = sizeRef.current;
    sizeRef.current = fitCanvas(canvas, wrap);
    // Keep the field proportional through a resize rather than re-seeding.
    if (prev.w && prev.h && nodesRef.current.length) {
      const sx = sizeRef.current.w / prev.w;
      const sy = sizeRef.current.h / prev.h;
      // Remapped rather than mutated in place: this runs from a callback, and
      // rebuilding the array keeps the compiler's immutability rule satisfied.
      nodesRef.current = nodesRef.current.map((n) => ({
        ...n,
        x: n.x * sx,
        y: n.y * sy,
      }));
    }
    // Resizing a canvas clears it; repaint immediately so the reduced-motion
    // path (which has no loop) never ends up blank.
    paintRef.current();
  }, []);

  useResize(wrapRef, resize);

  useEffect(() => {
    resize();
    if (!nodesRef.current.length) seed();
  }, [resize, seed]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      const { w, h } = sizeRef.current;
      const nodes = nodesRef.current;
      const reachNow = reachRef.current;
      ctx.clearRect(0, 0, w, h);

      // Links first, so nodes sit on top.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > reachNow) continue;
          const t = 1 - d / reachNow;
          ctx.strokeStyle = LAB.blueSoft;
          ctx.globalAlpha = 0.06 + t * 0.5;
          ctx.lineWidth = 0.5 + t * 1.1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.held ? 6 : 3.4, 0, Math.PI * 2);
        ctx.fillStyle = n.held ? LAB.coral : LAB.blue;
        ctx.fill();
        if (n.held) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 13, 0, Math.PI * 2);
          ctx.strokeStyle = LAB.coral;
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    };

    paintRef.current = paint;

    if (reduced) {
      paint();
      return;
    }

    const step = () => {
      const { w, h } = sizeRef.current;
      const nodes = nodesRef.current;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.held) continue;
        // Short-range repulsion keeps the field legible.
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const o = nodes[j];
          const dx = n.x - o.x;
          const dy = n.y - o.y;
          const d = Math.hypot(dx, dy);
          if (d < 46 && d > 0.01) {
            const push = ((46 - d) / 46) * 0.5;
            n.vx += (dx / d) * push;
            n.vy += (dy / d) * push;
          }
        }
        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x += n.vx;
        n.y += n.vy;
        // Bounce softly off the frame.
        if (n.x < 8) {
          n.x = 8;
          n.vx = Math.abs(n.vx) * 0.5;
        }
        if (n.x > w - 8) {
          n.x = w - 8;
          n.vx = -Math.abs(n.vx) * 0.5;
        }
        if (n.y < 8) {
          n.y = 8;
          n.vy = Math.abs(n.vy) * 0.5;
        }
        if (n.y > h - 8) {
          n.y = h - 8;
          n.vy = -Math.abs(n.vy) * 0.5;
        }
      }
      paint();
      rafRef.current = requestAnimationFrame(step);
    };

    if (near) rafRef.current = requestAnimationFrame(step);
    else paint();
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduced, near]);

  const local = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (reduced) return;
    const { x, y } = local(e);
    const nodes = nodesRef.current;
    let idx = -1;
    let best = 22;
    nodes.forEach((n, i) => {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < best) {
        best = d;
        idx = i;
      }
    });
    if (idx >= 0) {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = idx;
      nodes[idx].held = true;
      nodes[idx].vx = 0;
      nodes[idx].vy = 0;
    } else {
      nodes.push({ x, y, vx: 0, vy: 0, held: false });
      setCount(nodes.length);
    }
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const idx = dragRef.current;
    if (idx == null) return;
    const { x, y } = local(e);
    const n = nodesRef.current[idx];
    if (!n) return;
    // Velocity from the drag, so releasing mid-move sends it on.
    n.vx = (x - n.x) * 0.4;
    n.vy = (y - n.y) * 0.4;
    n.x = x;
    n.y = y;
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const idx = dragRef.current;
    dragRef.current = null;
    if (idx == null) return;
    const n = nodesRef.current[idx];
    if (n) n.held = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative h-[68svh] touch-pan-y overflow-hidden border-y border-rule bg-ink-raised"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={reduced ? "block" : "block cursor-grab active:cursor-grabbing touch-none"}
          role="img"
          aria-label="Node network — drag nodes, tap empty space to add one"
        />
        <LabHint>
          {reduced
            ? "Static network — motion reduced"
            : "Drag a node, or click empty space to add one"}
        </LabHint>
      </div>

      <LabControls>
        <span className="mono tabular-nums text-content-dim">
          {String(count).padStart(3, "0")} nodes
        </span>
        <LabSlider
          label="Reach"
          value={reach}
          min={80}
          max={360}
          onChange={setReach}
          suffix="px"
        />
        <div className="flex-1" />
        <LabButton onClick={seed} disabled={reduced}>
          Reset field
        </LabButton>
      </LabControls>
    </div>
  );
}

export default NodeField;
