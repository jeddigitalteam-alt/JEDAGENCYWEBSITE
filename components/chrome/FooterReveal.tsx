"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { footerCta } from "@/components/chrome/Footer";

/**
 * How far through the homepage the peek appears, and the slightly lower mark it
 * disappears at again on the way back up. The gap is the hysteresis: without
 * it, a single wheel notch sitting exactly on the threshold toggles the strip
 * on every frame.
 */
const SHOW_AT = 0.5;
const HIDE_AT = 0.46;

/**
 * Where the hand-off to the full footer is far enough along that the peek stops
 * being a control: out of the tab order, out of the accessibility tree, and out
 * of the way of clicks meant for the footer underneath. Two marks again, so
 * scroll jitter at the boundary cannot churn it.
 *
 * Under reduced motion the strip does not travel, so it is still sitting on the
 * band the footer is arriving into — it has to go sooner, before the footer's
 * own bottom row reaches it. With motion it is 88% off-screen by then anyway.
 */
const HANDOFF = { out: 0.88, in: 0.7 };
const HANDOFF_STILL = { out: 0.45, in: 0.3 };

/**
 * Owns the underlapping footer.
 *
 * Two jobs, both of which need the browser and neither of which needs a
 * library:
 *
 *  1. **Everywhere** — measure the footer and publish its height as
 *     `--footer-h`, which is the space the page layer reserves beneath itself
 *     for the footer to be uncovered into. Measured rather than hard-coded, so
 *     the footer can grow a column or a line of copy and the reveal still ends
 *     exactly flush. A footer taller than the window cannot be pinned to the
 *     bottom of it — its top edge would sit permanently off-screen — so past
 *     that point the effect turns itself off and the footer stays in normal
 *     flow. That is also the honest answer on a phone, where fixed elements and
 *     dynamic browser chrome disagree.
 *
 *  2. **Homepage only** — the peek. One passive scroll listener coalesced into
 *     a single write per animation frame, in the same shape as
 *     `useParallaxLayers`: React state changes only when the strip actually
 *     crosses a threshold, and the scroll-linked part is written straight to
 *     the node as a custom property so no frame costs a render.
 *
 * The reveal itself is CSS — see app/globals.css. Nothing here animates.
 */
export function FooterReveal() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const peekRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef(false);
  const [shown, setShown] = useState(false);

  /* --- reserved height, and whether the reveal can run at all ------------ */
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    if (!footer) return;
    const root = document.documentElement;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const height = Math.ceil(footer.getBoundingClientRect().height);
      const fits = height > 0 && height <= window.innerHeight;
      root.style.setProperty("--footer-h", `${height}px`);
      root.dataset.footerReveal = fits ? "on" : "off";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    /* The observer catches the footer reflowing — a font landing, a column
       wrapping, the pitch coming and going between routes. `resize` catches the
       window changing under a footer that did not, which is the other half of
       the "does it still fit" question. */
    const observer = new ResizeObserver(schedule);
    observer.observe(footer);
    window.addEventListener("resize", schedule, { passive: true });
    schedule();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      delete root.dataset.footerReveal;
      root.style.removeProperty("--footer-h");
    };
  }, []);

  /* --- the homepage peek ------------------------------------------------- */
  useEffect(() => {
    if (!isHome) return;
    const peek = peekRef.current;
    const layer = document.querySelector<HTMLElement>("[data-page-layer]");
    if (!peek || !layer) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let past = false;
    let handedOff = false;

    const read = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const rect = layer.getBoundingClientRect();
      const y = window.scrollY;

      /* Progress through the PAGE, not the document. The height reserved for
         the footer is not part of the homepage, so counting it would drag the
         halfway mark up the page every time the footer grew a line. The guard
         keeps the maths off a page with no meaningful runway, where a rounding
         error could read as "halfway". */
      const runway = rect.bottom + y - viewport;
      const progress = runway > viewport * 0.25 ? y / runway : 0;

      /* How much footer the page layer has already uncovered. True in both
         modes: pinned, the layer's bottom edge rises past the window's bottom
         and the footer appears in the gap; in normal flow, that same edge IS
         the footer's top edge. One measurement, no branch. */
      const revealed = Math.max(0, viewport - rect.bottom);
      const exit = Math.min(1, revealed / Math.max(1, peek.offsetHeight));
      peek.style.setProperty("--peek-exit", exit.toFixed(4));

      const handoff = still.matches ? HANDOFF_STILL : HANDOFF;
      past = past ? progress >= HIDE_AT : progress >= SHOW_AT;
      handedOff = handedOff ? exit > handoff.in : exit >= handoff.out;

      const next = past && !handedOff;
      if (next !== shownRef.current) {
        shownRef.current = next;
        setShown(next);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    /* The page's own height is not fixed: images land, and the articles
       assembly drops its pin the moment it finishes. Both move the halfway
       mark, and neither fires a scroll event. */
    const observer = new ResizeObserver(schedule);
    observer.observe(layer);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      peek.style.removeProperty("--peek-exit");
    };
  }, [isHome]);

  // Internal pages get the reveal and nothing else — no permanent strip.
  if (!isHome) return null;

  return (
    /* The outer element carries the scroll-linked hand-off (no transition, so
       it tracks the wheel exactly); the inner carries the show/hide, which is a
       state change and therefore a transition. Two elements because one cannot
       hold both a transitioned and an untransitioned transform. */
    <div
      ref={peekRef}
      className="footer-peek"
      data-shown={shown}
      aria-hidden={!shown}
      inert={!shown}
    >
      <div className="footer-peek__inner">
        <div className="footer-peek__row mx-auto flex w-full max-w-[120rem] items-center justify-between gap-4 px-5 py-3 md:px-8 md:py-4">
          <p className="text-step--1 md:text-step-0">Want to work with us?</p>
          <Link
            href="/contact"
            className={footerCta("px-5 py-2.5 md:px-6 md:py-3")}
          >
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FooterReveal;
