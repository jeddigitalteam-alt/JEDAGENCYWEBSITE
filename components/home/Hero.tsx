"use client";

import { motion } from "motion/react";
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
 * Three moving layers at 0.05 / 0.13 / 0.20, plus two static ones (grain and a
 * legibility scrim). Every layer overhangs the section generously so the lag
 * can never expose an edge, and the section already clips them.
 */
export function Hero() {
  const { introDone, shouldRun } = useIntro();
  const { sectionRef, setLayer } = useParallaxLayers([0.05, 0.13, 0.2]);

  // While the client is still deciding (shouldRun === null) hold the pre-state
  // so nothing flashes in front of the loader.
  const show = shouldRun === false || introDone;

  const rise = {
    initial: { y: "110%" },
    animate: show ? { y: "0%" } : { y: "110%" },
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
        className="pointer-events-none absolute -inset-x-[15%] -top-[35%] h-[170%] opacity-[0.7]"
        style={{
          background:
            "radial-gradient(58% 46% at 74% 26%, color-mix(in oklab, var(--blue) 26%, transparent) 0%, transparent 68%)",
        }}
      />

      {/* 1 — mid: oversized mark contours. The whole SVG is rotated, never the
             individual pieces, so the seam stays intact (see puzzle-paths). */}
      <div
        ref={setLayer(1)}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[10%] -top-[28%] h-[156%]"
      >
        <svg
          viewBox={VIEWBOX}
          className="absolute -right-[14%] top-[6%] w-[62vmax] text-blue opacity-[0.11]"
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
          className="absolute -left-[20%] bottom-[4%] w-[46vmax] -rotate-[18deg] text-blue opacity-[0.085]"
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
        className="pointer-events-none absolute -inset-x-[20%] -top-[22%] h-[144%]"
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
      {/* eyebrow */}
      <motion.div
        className="mono relative z-10 flex items-baseline gap-3 text-content-dim"
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
      >
        <span>London, UK</span>
        <span aria-hidden="true" className="h-px w-8 bg-rule" />
        <span>51.5074° N</span>
      </motion.div>

      <h1 className="display relative z-10 max-w-[22ch] text-hero">
        <span className="block overflow-hidden">
          <motion.span
            className="block"
            {...rise}
            transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
          >
            We build brands
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span
            className="block"
            {...rise}
            transition={{ duration: 0.9, delay: 0.14, ease: EASE }}
          >
            that <em>fit together</em>
          </motion.span>
        </span>
      </h1>

      <div className="relative z-10 flex items-end justify-between gap-6">
        <motion.p
          className="max-w-[34ch] text-step-0 text-content-dim"
          initial={{ opacity: 0, y: 12 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
        >
          A design studio in London. Identity, websites and product work for
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
