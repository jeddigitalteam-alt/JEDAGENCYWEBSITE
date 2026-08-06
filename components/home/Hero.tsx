"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/primitives";
import ServicesPanels from "@/components/home/ServicesPanels";
import { useIntro } from "@/components/motion/intro-context";
import { useParallaxLayers } from "@/lib/hooks/useParallax";
import { PIECE_A, PIECE_B, VIEWBOX } from "@/components/brand/puzzle-paths";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Grain, as a tiled SVG turbulence — no asset, no request, a few hundred bytes.
   Static by design: crawling noise reads as a rendering fault, not texture. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E\")";

/**
 * Hero. Mounted behind the loader from the first paint, and cued by
 * `introDone` — so the panels parting and this animating in are one move.
 *
 * TODO(assets): the brief calls for a full-bleed muted background video here.
 * None exists (see NOTES.md), so the backdrop below is built from the site's
 * own structural motif rather than stock imagery: the mark's contours and the
 * 45° interlock seam. §4 rules out gradient mesh and glassmorphism, so this
 * stays geometric. If a video does arrive, drop it in as the deepest layer and
 * hand it `setLayer(0)` — nothing else needs to change.
 *
 * Three moving layers at 0.15 / 0.30 / 0.45, plus two static ones (grain and a
 * legibility scrim). A layer at factor f travels at (1 - f) of page speed, so
 * the front layer drifts at ~55% — a differential you can actually see. The
 * first pass used 0.05/0.13/0.20, which lagged by only 45px across the whole
 * hero and read as static.
 *
 * Overhangs are sized against the travel, not by eye: the front layer moves up
 * to 0.45 x hero height, so it starts 60% above and stands 230% tall, leaving
 * slack at both ends no matter how far it drifts. The section clips them.
 */
export function Hero() {
  const { introDone, shouldRun } = useIntro();
  const { sectionRef, setLayer } = useParallaxLayers([0.15, 0.3, 0.45]);

  // While the client is still deciding (shouldRun === null) hold the pre-state
  // so nothing flashes in front of the loader.
  const show = shouldRun === false || introDone;

  /* 135% rather than 110%: the reveal masks now extend below the baseline to
     clear descenders (see the h1), so the line has further to travel before it
     is genuinely out of sight. */
  const rise = {
    initial: { y: "135%" },
    animate: show ? { y: "0%" } : { y: "135%" },
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh flex-col justify-between overflow-hidden px-5 pb-8 pt-28 md:px-8 md:pb-10"
    >
      {/* ---------------------------------------------------- backdrop ---
          Decorative only: aria-hidden, pointer-events-none, and stacked
          below the content, which carries `relative z-10`. */}

      {/* 0 — deepest: a single soft wash, off-centre so the composition reads
             as intentional at rest rather than centred and inert. */}
      <div
        ref={setLayer(0)}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[15%] -top-[40%] h-[190%] opacity-[0.7]"
        style={{
          background:
            "radial-gradient(52% 41% at 74% 26%, color-mix(in oklab, var(--blue) 26%, transparent) 0%, transparent 68%)",
        }}
      />

      {/* 1 — mid: oversized mark contours. The whole SVG is rotated, never the
             individual pieces, so the seam stays intact (see puzzle-paths). */}
      <div
        ref={setLayer(1)}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[10%] -top-[50%] h-[200%]"
      >
        <svg
          viewBox={VIEWBOX}
          className="absolute -right-[14%] top-[15.5%] w-[62vmax] text-blue opacity-[0.11]"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <path d={PIECE_A} />
          <path d={PIECE_B} />
        </svg>
        <svg
          viewBox={VIEWBOX}
          className="absolute -left-[20%] bottom-[14%] w-[46vmax] -rotate-[18deg] text-blue opacity-[0.085]"
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <path d={PIECE_A} />
          <path d={PIECE_B} />
        </svg>
      </div>

      {/* 2 — nearest: the interlock seam itself, at 45°, as sparse rules. */}
      <div
        ref={setLayer(2)}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[20%] -top-[60%] h-[230%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, color-mix(in oklab, var(--blue) 26%, transparent) 0 1px, transparent 1px 148px)",
        }}
      />

      {/* static — grain, then a scrim that guarantees type contrast over any
          part of the backdrop. Neither moves. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--ink) 62%, transparent) 0%, transparent 34%, transparent 62%, color-mix(in oklab, var(--ink) 72%, transparent) 100%)",
        }}
      />

      {/* ------------------------------------------------------ content --- */}
      {/* Each line sits in its own overflow-hidden mask so it can rise into
          view. `.display` runs a 0.92 line-height, so that mask is shorter than
          the type's real ink extent and it was slicing the descender off
          "together". The padding drops the clip edge below the baseline and the
          matching negative margin takes the space straight back, so the mask
          gets taller without the headline's spacing or size moving at all. */}
      {/* Headline and its call to action are one flex child, not two: the
          section is `justify-between`, so a sibling here would be pushed to the
          middle of the hero instead of sitting under the type. */}
      <div className="relative z-10">
      <h1 className="display max-w-[22ch] text-hero">
        <span className="block overflow-hidden pb-[0.22em] -mb-[0.22em]">
          <motion.span
            className="block"
            {...rise}
            transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
          >
            The missing piece
          </motion.span>
        </span>
        <span className="block overflow-hidden pb-[0.22em] -mb-[0.22em]">
          <motion.span
            className="block"
            {...rise}
            transition={{ duration: 0.9, delay: 0.14, ease: EASE }}
          >
            for <em>every brand.</em>
          </motion.span>
        </span>
      </h1>

        {/* The one CTA in the hero. Cued off the same `show` as the headline
            and delayed behind both of its lines, so it lands as the last beat
            of the same entrance rather than reading as a separate element.

            Prompt and button are one link, not two: a second anchor to the same
            place would give screen readers a duplicate destination and split
            the hover state across two elements. As one, the row is a single tab
            stop, the arrow answers to the same hover, and the pill keeps the
            shared button styling via `buttonClass`. */}
        <motion.div
          className="mt-8 md:mt-10"
          initial={{ opacity: 0, y: 14 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
        >
          <Link
            href="/contact"
            /* Stacks on narrow screens so the prompt sits above the button
               rather than squeezing it; side by side and centred from sm up. */
            className="group inline-flex flex-col items-start gap-3 rounded-full sm:flex-row sm:items-center sm:gap-5"
          >
            <span className="mono text-paper">
              Get a free quote
              <span
                aria-hidden="true"
                className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
            <span className={buttonClass("primary")}>Start a project</span>
          </Link>
        </motion.div>
      </div>

      {/* The service rail, inside the hero composition rather than as the
          section that used to follow it — so the cards are already moving on
          the first screen. It is the flexible child of this column: the
          headline block above and the standfirst below keep their natural
          heights, and the rail takes whatever is left between them, which is
          how it fits one screen at any desktop height without a negative
          margin or absolute positioning. */}
      {/* Deliberately not wrapped in an entrance of its own. The label inside it
          is a heading, and the shared reveal is already its entrance — a fade
          on this block would stack a second animation on top of that. The cards
          are simply there when the panels part, already moving. */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <ServicesPanels />
      </div>

      <div className="relative z-10 mt-6 flex items-end justify-between gap-6">
        <motion.p
          className="max-w-[34ch] text-step-0 text-content-dim"
          initial={{ opacity: 0, y: 12 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
        >
          A design studio in Hampshire. Identity, websites and product work for
          companies that would rather be understood than admired.
        </motion.p>

        <motion.div
          className="mono shrink-0 text-content-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Scroll — 01 / 06
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
