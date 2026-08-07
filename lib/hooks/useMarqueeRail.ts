"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Shared behaviour for the site's two auto-running rails: the service cards in
 * the hero and the process cards on /work.
 *
 * Both are the same construction — the items rendered twice, the track moved by
 * exactly -50% with the `marquee` keyframes — and this hook adds three things
 * on top of it.
 *
 * 1. **A definite track width.** The track is `width: max-content`, which is
 *    resolved from the children's intrinsic widths, and that is not always what
 *    the children end up being. Measuring the laid-out row and pinning the width
 *    is what makes `-50%` land on exactly one copy.
 *
 * 2. **A constant travel speed.** The duration is derived from that measured
 *    width rather than hardcoded, so the cards cross the screen at the same rate
 *    whatever the card width works out to. A fixed duration made apparent speed
 *    a function of viewport width.
 *
 * 3. **Grab-and-throw.** The rail can be dragged with a pointer or a finger; it
 *    follows the hand 1:1, keeps some of that momentum on release, and eases
 *    back to its own pace. Horizontal wheel and trackpad gestures feed the same
 *    momentum.
 *
 * ## How the drag works
 *
 * Nothing here writes a transform. The rail's position is the CSS animation's
 * own progress, so dragging simply moves that progress: `animation.currentTime`
 * is advanced by the distance dragged, converted through the rail's own scale
 * (one duration covers half the track). Three things fall out of doing it that
 * way rather than with a separate translate:
 *
 * - the loop stays seamless, because the animation wraps by itself and the drag
 *   never introduces an offset that has to be unwound;
 * - releasing needs no snap-back — the position the drag reached *is* the
 *   position, so the rail carries on from it;
 * - the transform stays the compositor's, so a drag costs no layout and no
 *   React render. Nothing in this hook sets state.
 *
 * Momentum on release is `playbackRate`, decaying exponentially back to 1.
 *
 * ## Not hijacking the page
 *
 * Vertical scrolling must be untouched, so gestures are only claimed once they
 * are unambiguous:
 *
 * - **Touch** — `touch-action: pan-y` on the viewport leaves vertical panning to
 *   the browser, which cancels our pointer stream the moment it takes over.
 * - **Pointer/mouse** — the first few pixels decide an axis, and a gesture that
 *   commits to vertical is never claimed, never captured, and never
 *   preventDefault-ed.
 * - **Wheel** — `deltaX` over `deltaY`, or shift held. Every ordinary vertical
 *   wheel passes straight through.
 */

/** Travel rate. The service rail's tuned pace — see CYCLE_S notes there. */
const DEFAULT_PX_PER_SECOND = 50.5;

/** Wheel pixels that buy one extra multiple of the base speed. */
const PIXELS_PER_UNIT = 110;

/**
 * How far input can push the rate, either side of its normal 1.
 *
 * The ceiling is what bounds the settle: a flick can be arbitrarily fast — a
 * 400px drag in 200ms works out at forty times the rail's own pace — so
 * without a cap the decay from it would run well past a second and a half.
 */
const MAX_BOOST = 6;
const MIN_BOOST = -5;

/**
 * Time constant of the ease back to normal, in seconds.
 *
 * Paired with the cap above: a full-strength throw settles in about 1.4s
 * (`tau x ln(MAX_BOOST / BOOST_EPSILON)`), and an ordinary one inside half a
 * second — which is the range this should feel like it takes.
 */
const DECAY_TAU = 0.24;

/** Below this the boost is spent; the loop stops and the rate is pinned to 1. */
const BOOST_EPSILON = 0.015;

/** Movement, in px, before a gesture commits to an axis. */
const AXIS_LOCK_PX = 6;

/** Past this, the gesture was a drag and the click it ends with is suppressed. */
const DRAG_SLOP_PX = 8;

/** Velocity samples older than this are stale for the throw. */
const VELOCITY_WINDOW_MS = 90;

export function useMarqueeRail<
  V extends HTMLElement,
  T extends HTMLElement,
>({
  enabled,
  pxPerSecond = DEFAULT_PX_PER_SECOND,
}: {
  /**
   * False under reduced motion, where both rails become ordinary horizontal
   * scrollers with no animation to drive and native scrolling to leave alone.
   */
  enabled: boolean;
  pxPerSecond?: number;
}): { viewportRef: RefObject<V | null>; trackRef: RefObject<T | null> } {
  const viewportRef = useRef<V>(null);
  const trackRef = useRef<T>(null);
  const animationRef = useRef<Animation | null>(null);
  /** Half the track, in px — the distance one cycle covers. */
  const cycleDistanceRef = useRef(0);

  /* ------------------------------------------------- track width and cycle */
  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport || !enabled) return;

    const apply = () => {
      const items = Array.from(track.children) as HTMLElement[];
      if (!items.length) return;

      let total = 0;
      for (const item of items) {
        // Fractional, not `offsetWidth` — a half-pixel per card across ten
        // cards is a five-pixel jump at the wrap, once every cycle, forever.
        total +=
          item.getBoundingClientRect().width +
          (parseFloat(getComputedStyle(item).marginRight) || 0);
      }
      if (total <= 0) return;

      track.style.width = `${total}px`;
      track.style.setProperty(
        "--cycle",
        `${(total / 2 / pxPerSecond).toFixed(2)}s`,
      );
      cycleDistanceRef.current = total / 2;
    };

    /* Observed on the viewport and on one card, never on the track itself:
       the track's width is what this writes, so observing it would feed its
       own output back in. Both fire once on observe, which is the initial
       measurement. */
    const ro = new ResizeObserver(apply);
    ro.observe(viewport);
    if (track.firstElementChild) ro.observe(track.firstElementChild);
    return () => ro.disconnect();
  }, [enabled, pxPerSecond]);

  /* --------------------------------------------------- drag, throw, wheel */
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || !enabled) return;

    /* The CSSAnimation behind the `marquee` keyframes. It does not exist until
       styles have resolved, so this retries across a frame or two rather than
       assuming it is there on mount. */
    let lookup = 0;
    let disposed = false;
    const findAnimation = () => {
      if (disposed) return;
      const running = track.getAnimations();
      const found =
        running.find(
          (a) => (a as { animationName?: string }).animationName === "marquee",
        ) ?? running[0];
      if (found) {
        animationRef.current = found;
        return;
      }
      if (lookup++ < 40) requestAnimationFrame(findAnimation);
    };
    findAnimation();

    let boost = 0;
    let raf = 0;
    let last = 0;

    const applyRate = () => {
      const a = animationRef.current;
      if (a) a.playbackRate = 1 + boost;
    };

    const settle = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      boost *= Math.exp(-dt / DECAY_TAU);

      if (Math.abs(boost) < BOOST_EPSILON) {
        boost = 0;
        raf = 0;
        last = 0;
        applyRate();
        return;
      }

      applyRate();
      raf = requestAnimationFrame(settle);
    };

    const push = (units: number) => {
      boost = Math.max(MIN_BOOST, Math.min(MAX_BOOST, boost + units));
      applyRate();
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(settle);
      }
    };

    /**
     * Move the rail by a distance, by moving the animation's own progress.
     *
     * `currentTime` is in ms and one duration covers `cycleDistance` px, so the
     * conversion is a straight ratio. Dragging left (`dx` negative) is the
     * direction the rail already travels, so it advances time.
     */
    const nudgeBy = (dx: number) => {
      const a = animationRef.current;
      const span = cycleDistanceRef.current;
      const duration = Number(a?.effect?.getTiming().duration ?? 0);
      if (!a || !span || !duration) return;
      const current = Number(a.currentTime ?? 0);
      a.currentTime = current - (dx * duration) / span;
    };

    /* ------------------------------------------------------------- wheel */
    const onWheel = (e: WheelEvent) => {
      const horizontal = e.shiftKey
        ? e.deltaX || e.deltaY
        : Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? e.deltaX
          : 0;

      // Primarily vertical, no modifier: this is page scrolling. Leave it be.
      if (!horizontal) return;

      e.preventDefault();
      push(horizontal / PIXELS_PER_UNIT);
    };

    /* -------------------------------------------------------- pointer drag */
    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let axis: "x" | "y" | null = null;
    let moved = 0;
    /** Recent {t, x} samples, for the release velocity. */
    let samples: { t: number; x: number }[] = [];

    const endGesture = () => {
      if (pointerId !== null) {
        try {
          viewport.releasePointerCapture(pointerId);
        } catch {
          // Already released, or the pointer is gone. Nothing to undo.
        }
      }
      pointerId = null;
      axis = null;
      samples = [];
      viewport.style.removeProperty("user-select");
    };

    const onPointerDown = (e: PointerEvent) => {
      // Second finger, or a non-primary mouse button: not a drag.
      if (pointerId !== null || !e.isPrimary || (e.pointerType === "mouse" && e.button !== 0))
        return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startY = e.clientY;
      axis = null;
      moved = 0;
      samples = [{ t: e.timeStamp, x: e.clientX }];
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;

      const dxTotal = e.clientX - startX;
      const dyTotal = e.clientY - startY;

      if (axis === null) {
        if (
          Math.abs(dxTotal) < AXIS_LOCK_PX &&
          Math.abs(dyTotal) < AXIS_LOCK_PX
        )
          return;
        axis = Math.abs(dxTotal) > Math.abs(dyTotal) ? "x" : "y";
        if (axis === "y") {
          // The page's gesture, not ours. Let go of it entirely.
          endGesture();
          return;
        }
        // Only now is it certainly horizontal, so only now do we take the
        // pointer and stop the browser turning it into a text selection.
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch {
          // Capture is best-effort; the move handler works without it.
        }
        viewport.style.setProperty("user-select", "none");
      }

      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved = Math.max(moved, Math.abs(dxTotal));

      if (e.cancelable) e.preventDefault();
      nudgeBy(dx);

      samples.push({ t: e.timeStamp, x: e.clientX });
      const cutoff = e.timeStamp - VELOCITY_WINDOW_MS;
      while (samples.length > 2 && samples[0].t < cutoff) samples.shift();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const wasDragging = axis === "x";
      const first = samples[0];
      const lastSample = samples[samples.length - 1];
      endGesture();
      if (!wasDragging || !first || !lastSample) return;

      /* Throw. The finger's velocity is converted into the rail's own units:
         one cycle covers `cycleDistance` px in `duration` ms, so that ratio is
         "normal speed" in px/ms and the finger's speed divided by it is the
         playback rate the gesture was worth. Dragging left is forwards, hence
         the sign. Subtracting 1 leaves it as a boost on top of the rail's own
         pace, which is what decays away. */
      const dt = lastSample.t - first.t;
      if (dt <= 0) return;
      const velocity = (lastSample.x - first.x) / dt; // px per ms
      const span = cycleDistanceRef.current;
      const duration = Number(
        animationRef.current?.effect?.getTiming().duration ?? 0,
      );
      if (!span || !duration) return;
      const normal = span / duration; // px per ms at rate 1
      const gestureRate = -velocity / normal;
      push(gestureRate - 1);
    };

    /** A drag that ended on a card must not also open it. */
    const onClickCapture = (e: MouseEvent) => {
      if (moved > DRAG_SLOP_PX) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };

    // `passive: false` on the two that may preventDefault, and only once the
    // gesture is known to be horizontal.
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove, { passive: false });
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", endGesture);
    viewport.addEventListener("click", onClickCapture, true);

    return () => {
      disposed = true;
      endGesture();
      animationRef.current = null;
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", endGesture);
      viewport.removeEventListener("click", onClickCapture, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return { viewportRef, trackRef };
}

export default useMarqueeRail;
