"use client";

import { useEffect, type RefObject } from "react";
import { getLenis } from "@/components/motion/lenis-instance";

/**
 * Scroll-driven assembly for a homepage section.
 *
 * The idea is taken from the Labs "Scroll assembly" experiment — a finite
 * scroll zone with a sticky stage inside it, and progress read from the zone's
 * own bounding rect every frame — but this is a separate implementation. Labs
 * drives a canvas; this drives real DOM that has to end up pixel-identical to
 * the static design and stay clickable. Neither file imports the other, so
 * changing one cannot break the other.
 *
 * The flight is scrubbed by scroll, but it runs ONE WAY. Progress is a
 * high-water mark: it follows the scroll forwards and simply holds when the
 * scroll goes back, so scrolling up never rewinds or pulls the section apart.
 * The moment every element is home the loop latches, writes the final state,
 * disconnects its observer and stops — after that the cards are ordinary
 * static DOM for the rest of the page session, mapped to nothing.
 *
 * Only `transform`, `opacity`, `box-shadow` and `border-radius` are written,
 * and only while the zone is near the viewport and the sequence is unfinished.
 * Every read — rects, scroll position, viewport size — is taken before any
 * write in the same frame, so the loop never thrashes layout. Nothing here
 * touches React state.
 */

/* --- plan -------------------------------------------------------------- */

/** Where an element starts. Distances are viewport units so the travel scales
 *  with the screen; rotation is degrees, scale and opacity are absolute. */
export type FlightTuning = {
  /** Horizontal start offset, vw. */
  x?: number;
  /** Vertical start offset, vh. */
  y?: number;
  rotate?: number;
  scale?: number;
  opacity?: number;
};

export type Flight = FlightTuning & {
  /** Selector, resolved inside the zone. */
  select: string;
  /** Where in the zone's progress this element starts moving, and over how
   *  much of it. Ignored when `ownPace` is in effect. */
  at?: number;
  span?: number;
  /**
   * Carry a hairline edge and a drop shadow while in flight, so the element
   * reads as a physical panel above the page rather than floating text. Both
   * are gone by the time it lands, which is what keeps the resting design
   * identical.
   */
  lift?: boolean;
  /**
   * Below `narrowAt`, take progress from this element's own slot (its parent,
   * which never moves) instead of the zone. On a stacked layout the three
   * cards are hundreds of pixels apart, so one shared progress would assemble
   * the lower two while they are still below the fold.
   */
  ownPace?: boolean;
  /** Overrides applied below `narrowAt`. */
  narrow?: FlightTuning;
};

export type AssemblyPlan = {
  flights: readonly Flight[];
  /**
   * The extra scroll height the flight needs, and how to give it back.
   *
   * `attr` is an attribute on the zone that the stylesheet keys its tall height
   * and its sticky stage off. The hook removes it the moment the sequence ends
   * — and never adds it under reduced motion — so the runway exists only while
   * something is actually animating. `stage` finds the pinned element, whose
   * on-screen position is what the scroll compensation holds still.
   */
  collapse?: { attr: string; stage: string };
  /** Zone top, as a share of the viewport, at progress 0. */
  start?: number;
  /** Share of the zone's over-viewport height spent reaching progress 1. The
   *  remainder is hold: the finished section stays pinned for a beat before
   *  the sticky stage releases. */
  pin?: number;
  /** Viewport width below which `narrow` and `ownPace` apply. */
  narrowAt?: number;
};

/* --- curve ------------------------------------------------------------- */

/** The Labs curve. The middle of the travel does most of the work, so the
 *  flight stays legible all the way in and still decelerates into the joint
 *  rather than snapping onto it. */
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Share of an element's span spent coming up to full opacity. Deliberately
 *  short: the entrance should be a visible flight, not a long fade. */
const OPACITY_IN = 0.3;

/** Own-pace window, in shares of the viewport: 0 with the slot's top just
 *  below the fold, 1 once it has risen a third of the way up. */
const OWN_FROM = 0.94;
const OWN_TO = 0.3;

/**
 * How far in the sequence may already be on the first frame the loop sees and
 * still count as "the user is arriving at the top of it".
 *
 * On a real downward approach there are several hundred pixels of scrolling
 * between the observer firing and progress leaving zero, so this is never
 * close. It is only crossed by a jump — a hash link, a restored history
 * position, an approach from below — and in those cases the right answer is to
 * show the section finished rather than play a partial or backwards sequence.
 */
const ARM_EPS = 0.02;

/* --- the lift, precomputed --------------------------------------------- */

const LIFT_STEPS = 20;
/** One string per 5% of lift, built once, so a frame only ever assigns a
 *  cached value instead of composing two color-mix() declarations. */
const LIFT = Array.from({ length: LIFT_STEPS + 1 }, (_, i) => {
  const q = i / LIFT_STEPS;
  if (q === 0) return { shadow: "", radius: "" };
  return {
    shadow:
      `0 0 0 1px color-mix(in oklab, var(--rule) ${Math.round(q * 100)}%, transparent), ` +
      `0 ${(30 * q).toFixed(0)}px ${(60 * q).toFixed(0)}px ` +
      `-${(22 * q).toFixed(0)}px ` +
      `color-mix(in oklab, var(--ink) ${Math.round(q * 26)}%, transparent)`,
    /* Matches rounded-xl, so a panel in flight has the frame's own corner. */
    radius: `${(12 * q).toFixed(1)}px`,
  };
});

type Resolved = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
};

type Mover = {
  el: HTMLElement;
  slot: HTMLElement | null;
  at: number;
  span: number;
  lift: boolean;
  ownPace: boolean;
  wide: Resolved;
  tight: Resolved;
  lastLift: number;
};

const resolve = (t: FlightTuning): Resolved => ({
  x: t.x ?? 0,
  y: t.y ?? 0,
  rotate: t.rotate ?? 0,
  scale: t.scale ?? 1,
  opacity: t.opacity ?? 1,
});

export function useScrollAssembly(
  zoneRef: RefObject<HTMLElement | null>,
  plan: AssemblyPlan,
  active: boolean,
) {
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    /* --- the temporary scroll runway ----------------------------------- */

    const pinAttr = plan.collapse?.attr;
    const pinValue = pinAttr ? zone.getAttribute(pinAttr) : null;
    const restorePin = () => {
      if (pinAttr && pinValue !== null) zone.setAttribute(pinAttr, pinValue);
    };

    /**
     * Give the extra height back, without the page appearing to move.
     *
     * Dropping the attribute takes the zone from two viewports to its own
     * content height and un-pins the stage, so everything from the stage
     * downwards jumps up the page. The fix is to measure the same element
     * either side of the change — synchronously, in this frame, before
     * anything is painted — and move the scroll position by exactly that
     * distance.
     *
     * Which element to measure depends on where the reader is. While any part
     * of the stage is on screen it is the stage that must not move. Once the
     * whole section is above them, what must not move is everything after it,
     * so the zone's bottom edge is the right reference — the two differ by the
     * stage's own change in height.
     *
     * Lenis has to be told through `scrollTo`, not by assignment.
     *
     * Its smooth scroll is an animation object holding its own `from` and `to`,
     * and every frame it recomputes `from + (to - from) * eased` and writes
     * that to the document. Setting `animatedScroll` directly is therefore
     * undone on the very next frame: traced frame by frame, the compensation
     * landed correctly (heading held to 0.1px) and then the following frame
     * put the scroll back where it had been — 532px of lurch, because the
     * document underneath was now 900px shorter. `scrollTo(…, immediate)` is
     * the supported path: it rewrites both scroll values, writes the DOM,
     * stops the in-flight animation, and suppresses the native scroll event
     * its own write provokes.
     *
     * Stopping that animation would otherwise cost the reader their momentum,
     * so the distance still to run is captured beforehand and handed straight
     * back as a fresh glide. Lenis ends the handoff scrolling normally —
     * neither stopped nor out of step with the document.
     */
    const collapse = () => {
      if (!pinAttr || !zone.hasAttribute(pinAttr)) return;
      const stage =
        (plan.collapse &&
          zone.querySelector<HTMLElement>(plan.collapse.stage)) ||
        zone;

      const stageBefore = stage.getBoundingClientRect();
      const zoneBefore = zone.getBoundingClientRect();
      const onScreen = stageBefore.bottom > 0;
      const lenis = getLenis();
      // Lenis's own value, not window.scrollY: it is the number Lenis will
      // write to the document next, and it carries sub-pixel precision.
      const y0 = lenis ? lenis.animatedScroll : window.scrollY;
      const remaining = lenis ? lenis.targetScroll - lenis.animatedScroll : 0;

      zone.removeAttribute(pinAttr);

      // Reading a rect here forces the new layout now, in this frame.
      const shift = onScreen
        ? stageBefore.top - stage.getBoundingClientRect().top
        : zoneBefore.bottom - zone.getBoundingClientRect().bottom;
      if (Math.abs(shift) < 1) return;

      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const y = Math.min(max, Math.max(0, y0 - shift));
      if (Math.abs(y0 - y) < 1) return;

      if (lenis) {
        // Re-measure first: the document just got shorter and a stale limit
        // would clamp the new position against the old bounds.
        lenis.resize();
        lenis.scrollTo(y, { immediate: true, force: true });
        if (Math.abs(remaining) > 2)
          lenis.scrollTo(y + remaining, { force: true });
      } else {
        window.scrollTo(0, y);
      }
    };

    if (!active) {
      /* Reduced motion: nothing animates, so the runway is pure dead scroll.
         Drop it immediately and leave the section at its natural height. */
      collapse();
      return restorePin;
    }

    const START = plan.start ?? 0.35;
    const PIN = plan.pin ?? 0.68;
    const NARROW_AT = plan.narrowAt ?? 768;

    const movers: Mover[] = [];
    for (const f of plan.flights) {
      const el = zone.querySelector<HTMLElement>(f.select);
      if (!el) continue;
      movers.push({
        el,
        slot: el.parentElement,
        at: f.at ?? 0,
        span: f.span ?? 0.72,
        lift: f.lift ?? false,
        ownPace: f.ownPace ?? false,
        wide: resolve(f),
        tight: resolve({ ...f, ...f.narrow }),
        lastLift: -1,
      });
    }
    if (movers.length === 0) return;

    /* --- reads --------------------------------------------------------- */

    /**
     * The lowest on-screen top an element can still be scrolled to. The zone
     * is the last thing on the page before the footer, so the ideal end point
     * is not always reachable — without this the last card would sit a few
     * percent short of home at the very bottom of the document. Both terms
     * fall together as you scroll, so the result is invariant: it compresses
     * the range when the page is out of room, and never warps the curve.
     */
    const floorFor = (top: number, vh: number) =>
      top -
      Math.max(0, document.documentElement.scrollHeight - vh - window.scrollY);

    /** Progress across the whole zone. 0 with its top START of the way down
     *  the viewport, 1 once the sticky stage has been pinned for PIN of its
     *  travel — which leaves the rest of the pin as hold. */
    const zoneProgress = (vh: number) => {
      const r = zone.getBoundingClientRect();
      const from = vh * START;
      const to = Math.max(
        -Math.max(0, r.height - vh) * PIN,
        floorFor(r.top, vh),
      );
      const travel = from - to;
      if (travel <= 8) return 1;
      return clamp01((from - r.top) / travel);
    };

    /** Progress for one card from its own slot — the slot never moves, so
     *  this cannot feed back into the transform being applied. */
    const slotProgress = (slot: HTMLElement, vh: number) => {
      const top = slot.getBoundingClientRect().top;
      const from = vh * OWN_FROM;
      const travel = from - Math.max(vh * OWN_TO, floorFor(top, vh));
      if (travel <= 8) return 1;
      return clamp01((from - top) / travel);
    };

    /* --- writes -------------------------------------------------------- */

    /**
     * `will-change` is on only while something is actually in flight.
     *
     * Leaving it on permanently keeps each card on its own composited layer,
     * and a composited layer is rasterised with greyscale anti-aliasing rather
     * than the sub-pixel anti-aliasing the rest of the page gets — so the
     * landed cards rendered their text very slightly differently from the
     * static design. Measured: every glyph edge in the grid differed. Dropping
     * the hint the moment the last card lands puts the resting text back on
     * exactly the same rasterisation path as before.
     */
    let hinted: boolean | null = null;
    const setHint = (on: boolean) => {
      if (on === hinted) return;
      hinted = on;
      for (const m of movers)
        m.el.style.willChange = on ? "transform, opacity" : "";
    };

    const place = (m: Mover, raw: number, narrow: boolean, vw: number, vh: number) => {
      const s = narrow ? m.tight : m.wide;
      const t = ease(raw);
      const r = 1 - t;

      if (r < 0.0008) {
        // Cleared rather than zeroed: a landed card carries no transform at
        // all, so it rasterises exactly as it does with the effect switched
        // off, and the resting design is the authored one.
        m.el.style.transform = "";
        m.el.style.opacity = "";
        if (m.lift && m.lastLift !== 0) {
          m.lastLift = 0;
          m.el.style.boxShadow = "";
          m.el.style.borderRadius = "";
        }
        return;
      }

      const scale = 1 - (1 - s.scale) * r;
      m.el.style.transform =
        `translate3d(${((s.x * r * vw) / 100).toFixed(1)}px, ` +
        `${((s.y * r * vh) / 100).toFixed(1)}px, 0) ` +
        `rotate(${(s.rotate * r).toFixed(2)}deg) scale(${scale.toFixed(4)})`;

      const o = s.opacity + (1 - s.opacity) * Math.min(1, raw / OPACITY_IN);
      m.el.style.opacity = o > 0.998 ? "" : o.toFixed(3);

      if (m.lift) {
        const step = Math.round(r * LIFT_STEPS);
        if (step !== m.lastLift) {
          m.lastLift = step;
          m.el.style.boxShadow = LIFT[step].shadow;
          m.el.style.borderRadius = LIFT[step].radius;
        }
      }
    };

    /** The finished state, written directly. Identical to what `place` emits at
     *  progress 1, but it needs no viewport measurements, so it is also what a
     *  jump straight past the section resolves to. */
    const settleAll = () => {
      for (const m of movers) {
        m.el.style.transform = "";
        m.el.style.opacity = "";
        if (m.lift) {
          m.lastLift = 0;
          m.el.style.boxShadow = "";
          m.el.style.borderRadius = "";
        }
      }
    };

    /* --- loop, gated on proximity -------------------------------------- */

    let raf = 0;
    let running = false;
    let lastKey = "";

    /* One-way state. All three live for the life of the effect — the whole
       page session in practice — so leaving the viewport, or the observer
       firing again on the way back, cannot reset or replay anything.

       started : the sequence has been armed by a genuine downward approach.
       latched : it has finished. Terminal; nothing writes to these elements
                 again and the loop is torn down.
       held    : per-element high-water mark. Progress only ever climbs, so
                 scrolling back up holds the flight where it is rather than
                 running it backwards. */
    let started = false;
    let latched = false;
    let firstFrame = true;
    const held = movers.map(() => 0);
    /** Previous scroll position, for the downward-approach test. */
    let lastY = 0;

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      setHint(false);
    };

    /** Terminal. The cards become ordinary static DOM from here, and the
     *  section gives back the scroll height it borrowed. */
    const finish = () => {
      if (latched) return; // the handoff runs once, whichever path reaches it
      latched = true;
      // Final transforms first, so the layout being measured for the scroll
      // compensation is the one the reader is actually looking at.
      settleAll();
      collapse();
      stop();
      io.disconnect();
    };

    const frame = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight || 1;
      const narrow = vw < NARROW_AT;

      // Every read first, then every write.
      const y = window.scrollY;
      const p = zoneProgress(vh);
      const raws = movers.map((m) =>
        narrow && m.ownPace && m.slot
          ? slotProgress(m.slot, vh)
          : clamp01((p - m.at) / m.span),
      );

      if (firstFrame) {
        firstFrame = false;
        lastY = y;
        // Already part-way through the very first time the loop looks: the
        // page opened here, came back to a restored history position, or
        // approached from below. Show the section finished rather than play a
        // partial sequence or run one backwards.
        if (raws.some((v) => v > ARM_EPS)) {
          finish();
          return;
        }
      }
      // Arm on a genuine downward move, so an observer that fires from a
      // resize or a layout shift while the page is still cannot start
      // anything. Until then everything is pinned at the start of its flight —
      // which is off screen, so there is nothing to see and nothing to snap.
      if (!started && y > lastY) started = true;
      lastY = y;

      let allHome = started;
      for (let i = 0; i < movers.length; i++) {
        const v = started ? raws[i] : 0;
        if (v > held[i]) held[i] = v;
        if (held[i] < 1) allHome = false;
      }

      const key = `${vw}x${vh}|${held.map((v) => v.toFixed(4)).join(",")}`;
      if (key !== lastKey) {
        lastKey = key;
        setHint(held.some((v) => v > 0 && v < 1));
        for (let i = 0; i < movers.length; i++)
          place(movers[i], held[i], narrow, vw, vh);
      }

      if (allHome) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || latched) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      (entries) => (entries[0]?.isIntersecting ? start() : stop()),
      { rootMargin: "400px 0px" },
    );
    io.observe(zone);

    return () => {
      io.disconnect();
      stop();
      restorePin();
      // Back to the markup as authored — which is also the reduced-motion and
      // no-JS appearance, so the section has exactly one resting state.
      for (const m of movers) {
        m.el.style.transform = "";
        m.el.style.opacity = "";
        m.el.style.boxShadow = "";
        m.el.style.borderRadius = "";
        m.el.style.willChange = "";
      }
    };
  }, [zoneRef, plan, active]);
}

export default useScrollAssembly;
