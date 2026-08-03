"use client";

import Matter from "matter-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";
import {
  LAB,
  LabButton,
  LabControls,
  LabHint,
  fitCanvas,
  useNearViewport,
} from "./labs-kit";

const PALETTE = [LAB.blue, LAB.blueSoft, LAB.coral, LAB.chalk];
const SIZE = 78;
/** Dropped in once the scene is first seen, so it never opens empty. */
const SEED = 12;

/**
 * Piece physics. Drop pieces, then grab and throw them — they keep the
 * momentum of the throw, tumble, collide with each other and stay inside the
 * frame.
 *
 * Matter runs the simulation; we draw every body ourselves so the pieces are
 * real knob-and-socket shapes rather than boxes, and so the scene can be
 * exported. Dragging is Matter's own MouseConstraint, which is what carries
 * release velocity into the throw — hand-rolling it would lose that.
 *
 * Labs-only geometry: this shape is defined here and shares nothing with the
 * site logo, the cursor or the loader.
 *
 * The runner and the render loop both stop when the scene scrolls away.
 * Reduced motion gets a static tiling and no engine at all.
 */
export function PiecePhysics() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const rafRef = useRef(0);
  const [count, setCount] = useState(0);
  const reduced = useReducedMotionPref();
  const near = useNearViewport(wrapRef);
  /* Read by the render loop. Held in a ref rather than an effect dependency
     because re-running that effect would tear down and rebuild the Matter
     engine, throwing away every piece currently in the scene. */
  const nearRef = useRef(near);
  useEffect(() => {
    nearRef.current = near;
  }, [near]);

  const drawPiece = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    color: string,
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
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.16;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  };

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return { w: 0, h: 0 };
    return fitCanvas(canvas, wrap);
  }, []);

  useEffect(() => {
    let { w, h } = resize();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !w || !h) return;

    if (reduced) {
      const cols = Math.ceil(w / SIZE);
      const rows = Math.ceil(h / SIZE);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          drawPiece(
            ctx,
            c * SIZE + SIZE / 2,
            r * SIZE + SIZE / 2,
            0,
            PALETTE[(r + c) % PALETTE.length],
          );
      return;
    }

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0011 },
    });
    engineRef.current = engine;

    const wallOpts = { isStatic: true, restitution: 0.2 };
    let walls = [
      Matter.Bodies.rectangle(w / 2, h + 30, w + 400, 60, wallOpts),
      Matter.Bodies.rectangle(w / 2, -30, w + 400, 60, wallOpts),
      Matter.Bodies.rectangle(-30, h / 2, 60, h * 2, wallOpts),
      Matter.Bodies.rectangle(w + 30, h / 2, 60, h * 2, wallOpts),
    ];
    Matter.Composite.add(engine.world, walls);

    /* Drag + throw. MouseConstraint tracks release velocity, so letting go
       mid-swing actually throws the piece instead of dropping it. */
    const mouse = Matter.Mouse.create(canvas);
    /* Matter attaches its own wheel and touch listeners with passive:false and
       calls preventDefault() in both — Mouse.js cancels every `wheel`, and
       cancels `touchmove`/`touchstart`/`touchend` whenever the event carries
       changedTouches. Over a full-width canvas that means the page cannot be
       scrolled by wheel or by finger at all while the pointer is above the
       scene. Hand all of them back so the document scrolls normally; the
       experiment keeps mouse and pen dragging through MouseConstraint, and
       tap-to-drop still works through the React pointer handler below. */
    const m = mouse as unknown as {
      element: HTMLElement;
      mousewheel: EventListener;
      mousemove: EventListener;
      mousedown: EventListener;
      mouseup: EventListener;
    };
    m.element.removeEventListener("wheel", m.mousewheel);
    m.element.removeEventListener("touchmove", m.mousemove);
    m.element.removeEventListener("touchstart", m.mousedown);
    m.element.removeEventListener("touchend", m.mouseup);
    const drag = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.Composite.add(engine.world, drag);

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    const loop = () => {
      // The solver is already paused off screen; skip the repaint too rather
      // than redrawing a scene nobody can see on every frame.
      if (!nearRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
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

    const onResize = () => {
      ({ w, h } = resize());
      Matter.Composite.remove(engine.world, walls);
      walls = [
        Matter.Bodies.rectangle(w / 2, h + 30, w + 400, 60, wallOpts),
        Matter.Bodies.rectangle(w / 2, -30, w + 400, 60, wallOpts),
        Matter.Bodies.rectangle(-30, h / 2, 60, h * 2, wallOpts),
        Matter.Bodies.rectangle(w + 30, h / 2, 60, h * 2, wallOpts),
      ];
      Matter.Composite.add(engine.world, walls);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      Matter.Runner.stop(runner);
      Matter.Composite.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      runnerRef.current = null;
    };
  }, [resize, reduced]);

  // Stop the solver and the paint loop while the scene is off screen.
  useEffect(() => {
    const runner = runnerRef.current;
    if (!runner || reduced) return;
    runner.enabled = near;
  }, [near, reduced]);

  // Seed a handful the first time the scene comes into view, so there is
  // something to grab on arrival rather than an empty frame waiting for a click.
  const seededRef = useRef(false);
  useEffect(() => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!near || reduced || seededRef.current || !engine || !canvas) return;
    seededRef.current = true;
    const { width, height } = canvas.getBoundingClientRect();
    if (!width) return;
    for (let i = 0; i < SEED; i++) {
      Matter.Composite.add(
        engine.world,
        Matter.Bodies.rectangle(
          width * (0.12 + (i / (SEED - 1)) * 0.76),
          height * (0.12 + (i % 2) * 0.14),
          SIZE,
          SIZE,
          {
            restitution: 0.3,
            friction: 0.3,
            angle: (i - SEED / 2) * 0.24,
            render: { fillStyle: PALETTE[i % PALETTE.length] },
          },
        ),
      );
    }
    setCount(SEED);
  }, [near, reduced]);

  const addPiece = (clientX: number, clientY: number) => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas || reduced) return;
    const rect = canvas.getBoundingClientRect();
    const body = Matter.Bodies.rectangle(
      clientX - rect.left,
      clientY - rect.top,
      SIZE,
      SIZE,
      {
        restitution: 0.3,
        friction: 0.3,
        angle: (Math.random() - 0.5) * 0.6,
        render: { fillStyle: PALETTE[count % PALETTE.length] },
      },
    );
    Matter.Composite.add(engine.world, body);
    setCount((c) => c + 1);
  };

  const reset = () => {
    const engine = engineRef.current;
    if (!engine) return;
    for (const body of Matter.Composite.allBodies(engine.world))
      if (!body.isStatic) Matter.Composite.remove(engine.world, body);
    setCount(0);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = LAB.ink;
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement("a");
    link.download = `puzzle-pieces-${Date.now()}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  };

  return (
    <div>
      <div
        ref={wrapRef}
        /* pan-y keeps the page scrollable with a finger; a drag that starts on
           a piece is claimed by Matter via pointer capture. */
        className="relative h-[74svh] touch-pan-y overflow-hidden border-y border-rule bg-ink-raised"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            // Only spawn on empty space — otherwise this fights the drag.
            const engine = engineRef.current;
            if (!engine) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            const hit = Matter.Query.point(
              Matter.Composite.allBodies(engine.world).filter((b) => !b.isStatic),
              point,
            );
            if (!hit.length) addPiece(e.clientX, e.clientY);
          }}
          className={reduced ? "block" : "block cursor-grab active:cursor-grabbing"}
          role="img"
          aria-label="Physics scene — drop puzzle pieces, then drag and throw them"
        />
        {!count && !reduced ? (
          <p className="mono pointer-events-none absolute inset-0 grid place-items-center text-content-dim">
            Click to drop a piece — then grab one and throw it
          </p>
        ) : null}
        {reduced ? <LabHint>Static tiling — motion reduced</LabHint> : null}
      </div>

      <LabControls>
        <span className="mono tabular-nums text-content-dim">
          {String(count).padStart(3, "0")} pieces
        </span>
        <div className="flex-1" />
        <LabButton onClick={reset} disabled={!count}>
          Reset
        </LabButton>
        <LabButton onClick={download} tone="coral">
          Download PNG
        </LabButton>
      </LabControls>
    </div>
  );
}

export default PiecePhysics;
