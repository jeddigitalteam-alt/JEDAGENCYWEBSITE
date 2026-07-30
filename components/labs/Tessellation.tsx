"use client";

import Matter from "matter-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";

const PALETTE = ["#12A8FF", "#38B6FF", "#FF9B79", "#E0E0E0"];
const SIZE = 62;

/**
 * Tessellation generator. Click to drop puzzle pieces; they fall, collide and
 * settle against each other with real physics.
 *
 * Matter drives the simulation but not the drawing — we render each body
 * ourselves so the pieces are actual knob-and-socket shapes rather than
 * rectangles, and so the canvas can be exported as a PNG.
 *
 * Reduced motion gets a static generated tiling instead of a simulation.
 */
export function Tessellation() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const rafRef = useRef(0);
  const [count, setCount] = useState(0);
  const reduced = useReducedMotionPref();

  /** One piece: a square with a knob on the right and a socket on the left. */
  const drawPiece = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    color: string,
  ) => {
    const h = SIZE / 2;
    const k = SIZE * 0.19; // knob radius
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-h, -h);
    ctx.lineTo(h, -h);
    // right edge with an outward knob
    ctx.lineTo(h, -k);
    ctx.arc(h, 0, k, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(h, h);
    ctx.lineTo(-h, h);
    // left edge with a matching socket
    ctx.lineTo(-h, k);
    ctx.arc(-h, 0, k, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.14;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
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
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }, []);

  useEffect(() => {
    const prefersReduced = reduced;
    const { w, h } = sizeCanvas();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !w || !h) return;

    if (prefersReduced) {
      // Static tiling — same shapes, no simulation.
      const cols = Math.ceil(w / SIZE);
      const rows = Math.ceil(h / SIZE);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          drawPiece(
            ctx,
            c * SIZE + SIZE / 2,
            r * SIZE + SIZE / 2,
            0,
            PALETTE[(r + c) % PALETTE.length],
          );
        }
      }
      return;
    }

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: 0.0011 } });
    engineRef.current = engine;

    const wallOpts = { isStatic: true, restitution: 0.2 };
    const walls = [
      Matter.Bodies.rectangle(w / 2, h + 30, w + 200, 60, wallOpts),
      Matter.Bodies.rectangle(-30, h / 2, 60, h * 2, wallOpts),
      Matter.Bodies.rectangle(w + 30, h / 2, 60, h * 2, wallOpts),
    ];
    Matter.Composite.add(engine.world, walls);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (const body of Matter.Composite.allBodies(engine.world)) {
        if (body.isStatic) continue;
        drawPiece(
          ctx,
          body.position.x,
          body.position.y,
          body.angle,
          (body.render as { fillStyle?: string }).fillStyle ?? PALETTE[0],
        );
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => sizeCanvas();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.Composite.clear(engine.world, false);
      engineRef.current = null;
    };
  }, [sizeCanvas, reduced]);

  const drop = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas || reduced) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const body = Matter.Bodies.rectangle(x, y, SIZE, SIZE, {
      restitution: 0.25,
      friction: 0.35,
      angle: (Math.random() - 0.5) * 0.5,
      render: { fillStyle: PALETTE[count % PALETTE.length] },
    });
    Matter.Composite.add(engine.world, body);
    setCount((c) => c + 1);
  };

  const clear = () => {
    const engine = engineRef.current;
    if (!engine) return;
    for (const body of Matter.Composite.allBodies(engine.world)) {
      if (!body.isStatic) Matter.Composite.remove(engine.world, body);
    }
    setCount(0);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Flatten onto ink so the PNG isn't transparent where the page shows through.
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0F0F12";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement("a");
    link.download = `puzzle-tessellation-${Date.now()}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  };

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative h-[70svh] overflow-hidden rounded-2xl border border-rule bg-ink-raised"
      >
        <canvas
          ref={canvasRef}
          onClick={drop}
          className={reduced ? "block" : "block cursor-crosshair"}
          aria-label="Tessellation canvas"
          role="img"
        />
        {!count && !reduced ? (
          <p className="mono pointer-events-none absolute inset-0 grid place-items-center text-content-dim">
            Click anywhere to drop a piece
          </p>
        ) : null}
        {reduced ? (
          <p className="mono pointer-events-none absolute bottom-4 left-4 text-content-dim">
            Static tiling — motion reduced
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="mono tabular-nums text-content-dim">
          {String(count).padStart(3, "0")} pieces
        </span>
        <div className="flex-1" />
        <button
          onClick={clear}
          disabled={!count}
          className="mono rounded-full border border-rule px-5 py-2.5 transition-colors enabled:hover:border-blue enabled:hover:text-blue disabled:opacity-40"
        >
          Clear
        </button>
        <button
          onClick={download}
          className="mono rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-coral hover:text-coral"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}

export default Tessellation;
