"use client";

import NumberFlow from "@number-flow/react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";

/**
 * The supplied bar-chart component, adapted to this site.
 *
 * Kept from the original: the candy-striped track, the bar growing out of the
 * bottom on a spring, `NumberFlow` counting the value inside it, the pill that
 * holds the figure, the callout with its dot and triangular tail, and the
 * per-bar stagger. Those are the piece of design that was supplied and they are
 * unchanged in behaviour.
 *
 * What changed, and why:
 *
 *   - `framer-motion` -> `motion/react`. Same library; this project imports it
 *     under its current name, and adding the legacy package would have meant
 *     two copies of the same animation runtime.
 *   - `lucide-react` was imported for `CirclePercent`, which the component never
 *     rendered. Removed rather than installed.
 *   - `lg::text-6xl` is not a class — a stray second colon meant the large-screen
 *     size silently never applied. The heading now goes through
 *     `SectionHeading`, which is how every other heading on this site is set.
 *   - shadcn tokens (`bg-primary`, `bg-muted`, `text-muted-foreground`,
 *     `container`) do not exist here. Mapped to the semantic layer, so the whole
 *     thing inverts with `[data-invert]` like everything else, and the
 *     highlighted bar takes the real `--blue`.
 *   - Entrance is on scroll via `useInViewOnce`, not on mount. The original
 *     animated as soon as it was constructed, which for a section this far down
 *     the page means it has finished before anyone reaches it.
 *
 * **The numbers are real.** The supplied placeholders — 35/25/99/37 against
 * "competitor 1..4" — were removed and not replaced with invented equivalents.
 * There is no defensible performance data in this repository to put here:
 * `lib/work.ts` states outright that analytics are "the client's data to
 * publish, not ours", and its own outcome list is deliberately non-numeric. So
 * this charts the one honest set of figures the site already publishes — the
 * phase breakdown of a digital product engagement, which appears in full on
 * that service page — and the section argues from it rather than from a
 * fabricated conversion rate.
 */

/**
 * Straight from `lib/services.ts` — the `digital-product-design` phases, in
 * order. Not imported from there on purpose: this is a fixed illustration of
 * one engagement, and it should not silently redraw itself if that service's
 * schedule is ever re-planned.
 */
const PHASES: { weeks: number; label: string; highlight?: boolean }[] = [
  { weeks: 2, label: "Discovery" },
  { weeks: 3, label: "Flows and prototype", highlight: true },
  { weeks: 3, label: "Interface design" },
  { weeks: 2, label: "Library" },
];

const LONGEST = Math.max(...PHASES.map((p) => p.weeks));
const TOTAL = PHASES.reduce((n, p) => n + p.weeks, 0);

const css = `
  /* The supplied candy stripe, drawn from the token layer instead of a
     hard-coded grey — so the track is a near-paper on an inverted section and
     an ink-raised anywhere dark, with no second set of colours. */
  .candy-bg {
    background-color: color-mix(in oklab, var(--surface-raised) 55%, transparent);
    background-image: linear-gradient(
      135deg,
      var(--surface-raised) 25%,
      transparent 25.5%,
      transparent 50%,
      var(--surface-raised) 50.5%,
      var(--surface-raised) 75%,
      transparent 75.5%,
      transparent
    );
    background-size: 10px 10px;
  }`;

export function ResultsStats() {
  const reduced = useReducedMotion();
  const { ref, seen } = useInViewOnce<HTMLDivElement>({
    immediate: reduced === true,
  });

  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <style>{css}</style>

      <div className="mx-auto max-w-[46rem] text-center">
        <Eyebrow as="h2">How we judge it</Eyebrow>
        <SectionHeading
          roman="Good design has"
          italic="a job to do"
          className="mx-auto mt-4 max-w-[16ch]"
        />
        <p className="mx-auto mt-6 max-w-[54ch] text-step-0 text-content-dim">
          Which means the job has to be decided before anything is drawn. Below
          is a real Puzzle engagement, phase by phase — half of it happens
          before the interface is designed at all.
        </p>
      </div>

      <div
        ref={ref}
        className="mx-auto mt-16 flex h-72 w-full max-w-4xl items-end justify-center gap-2 sm:h-96 md:mt-24 md:h-[28rem] md:gap-3"
      >
        {PHASES.map((phase, index) => (
          <motion.div
            key={phase.label}
            initial={false}
            animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: reduced ? 0 : 0.5,
              delay: reduced ? 0 : index * 0.2,
              type: reduced ? "tween" : "spring",
              damping: 10,
            }}
            className="h-full w-full min-w-0"
          >
            <Bar
              {...phase}
              seen={seen}
              reduced={reduced === true}
              delay={index * 0.2}
            />
          </motion.div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-[52ch] text-center text-step--1 text-content-dim">
        {TOTAL} weeks, as published on the{" "}
        <Link
          href="/services/digital-product-design"
          className="underline decoration-[color:var(--link-underline)] decoration-1 underline-offset-4 transition-colors hover:text-blue"
          style={{ color: "var(--link)" }}
        >
          digital product design
        </Link>{" "}
        page. A schedule, not a performance claim — we do not publish clients&rsquo;
        analytics as if they were ours.
      </p>
    </section>
  );
}

function Bar({
  weeks,
  label,
  highlight = false,
  seen,
  reduced,
  delay = 0,
}: {
  weeks: number;
  label: string;
  highlight?: boolean;
  seen: boolean;
  reduced: boolean;
  delay?: number;
}) {
  /* Height is relative to the longest phase, so the tallest bar fills the track
     and the rest read as a proportion of it. */
  const height = `${(weeks / LONGEST) * 100}%`;
  const spring = {
    duration: reduced ? 0 : 0.5,
    type: reduced ? ("tween" as const) : ("spring" as const),
    damping: 20,
    delay: reduced ? 0 : delay,
  };

  return (
    <div className="group relative h-full w-full min-w-0">
      <div className="candy-bg relative h-full w-full overflow-hidden rounded-2xl md:rounded-[40px]">
        <motion.div
          initial={false}
          animate={
            seen ? { opacity: 1, y: 0, height } : { opacity: 0, y: 100, height: 0 }
          }
          transition={spring}
          className={cn(
            "absolute bottom-0 mt-auto w-full rounded-2xl p-2 md:rounded-[40px] md:p-3",
            /* Ink on blue, never white on blue — 2.6:1 against 7.4:1. The
               unhighlighted bars take the raised surface with normal ink. */
            highlight ? "bg-blue text-ink" : "bg-surface-raised text-content",
          )}
        >
          <div className="relative flex h-10 w-full items-center justify-center gap-2 rounded-full bg-content/5 text-step--1 tabular-nums tracking-tight md:h-14">
            <NumberFlow value={weeks} suffix="w" />
          </div>
        </motion.div>
      </div>

      {/* The callout, pinned to the top of its bar. Only the highlighted phase
          carries one; the others render the same structure at zero opacity so
          every bar keeps identical layout.

          Hidden below `sm`. The label is ~150px wide and a bar at 390px is
          ~78px, so centring it on the bar puts it past the edge of the document
          — measured as 14px of horizontal overflow. Shrinking the text to fit
          would make it unreadable, and clipping it would cut a floating label
          in half; the blue bar underneath already carries the emphasis on its
          own at that size. */}
      <motion.div
        initial={false}
        animate={seen ? { opacity: 1, height } : { opacity: 0, height: 0 }}
        transition={spring}
        className="pointer-events-none absolute bottom-0 hidden w-full sm:block"
      >
        <motion.div
          initial={false}
          animate={{
            opacity: highlight ? 1 : 0,
            y: highlight ? 0 : 100,
          }}
          transition={spring}
          className="absolute -top-9 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-blue px-2 py-1 text-step--1 text-ink"
        >
          <div className="absolute -bottom-9 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-blue" />
          <svg
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-blue"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3.83855 8.41381C4.43827 9.45255 5.93756 9.45255 6.53728 8.41381L9.65582 3.01233C10.2555 1.97359 9.50589 0.675159 8.30646 0.675159H2.06937C0.869935 0.675159 0.120287 1.97359 0.720006 3.01233L3.83855 8.41381Z"
              fill="currentColor"
            />
          </svg>
          tested before it is built
        </motion.div>
      </motion.div>

      <p className="mx-auto mt-3 w-full text-center text-step--1 leading-tight text-content-dim">
        {label}
      </p>
    </div>
  );
}

export default ResultsStats;
