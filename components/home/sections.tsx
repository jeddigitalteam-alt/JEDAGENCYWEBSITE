"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  useScrollAssembly,
  type AssemblyPlan,
} from "@/components/home/use-scroll-assembly";
import { CLIENTS } from "@/lib/site";
import { TESTIMONIALS } from "@/lib/team";
import { ARTICLES } from "@/lib/articles";
import { WORK } from "@/lib/work";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";
import WorkTile from "@/components/work/WorkTile";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ work */

export function SelectedWork() {
  const shown = WORK.slice(0, 4);
  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Selected work</Eyebrow>
          <SectionHeading roman="Recent" italic="work" className="mt-4" />
        </div>
        <Link
          href="/work"
          className="mono rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
        >
          All work — {WORK.length}
        </Link>
      </div>

      <div className="grid gap-x-6 gap-y-14 md:grid-cols-2">
        {shown.map((study, i) => {
          const featured = i % 3 === 0;
          return (
            <div key={study.slug} className={featured ? "md:col-span-2" : ""}>
              <WorkTile
                study={study}
                index={i}
                priority={i === 0}
                sizes={
                  featured
                    ? "(min-width: 768px) 100vw, 100vw"
                    : "(min-width: 768px) 50vw, 100vw"
                }
                /* The featured tile runs the full width of the page, so a fixed
                   4:3 box grows past the height of the viewport on any wide
                   monitor — 115% at 1440px, 281% at 3440px. The ratio gives it
                   a banner shape from lg up, and the max-height is the ceiling
                   that ultrawide displays need, where even 2:1 is still taller
                   than the screen. Below lg it stays 4:3, untouched. */
                frameClassName={
                  featured
                    ? "lg:aspect-[16/9] lg:max-h-[82vh] 2xl:aspect-[2/1]"
                    : ""
                }
                /* The banner crop is much wider than the source, so a blind
                   centre left the campaign lock-up sitting high. 45% puts its
                   measured centre of mass on the middle of the frame. At the
                   4:3 crop used below lg the source is almost the same ratio,
                   so this moves it by a fraction of a percent — tablet and
                   mobile are effectively untouched. */
                imagePosition={featured ? "center 45%" : undefined}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- clients */

/**
 * Infinite marquee. The list is duplicated once and the track translates by
 * exactly -50%, so the loop is seamless regardless of item widths.
 * Paused on hover, and not animated at all under reduced motion.
 */
export function ClientRail() {
  const reduced = useReducedMotion();
  /* The track translates by exactly -50%, so the second half has to mirror the
     first. Two passes of the client list per half: that keeps the first half
     wider than any viewport (so the seam never shows) and keeps the total track
     close to the width it had with the old ten-name list, which is what holds
     the 38s animation at the same apparent speed. */
  const half = [...CLIENTS, ...CLIENTS];
  const items = [...half, ...half];

  return (
    <section
      data-invert
      className="overflow-hidden border-y border-rule bg-surface py-16 text-content"
    >
      <Eyebrow className="mb-8 px-5 md:px-8">Selected clients</Eyebrow>

      {reduced ? (
        <ul className="flex flex-wrap gap-x-10 gap-y-4 px-5 md:px-8">
          {CLIENTS.map((c) => (
            <li key={c} className="display text-step-2 text-content-dim">
              {c}
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative flex overflow-hidden">
          {/* Runs continuously — no hover/focus pause. The track must never
              stall while the pointer crosses it. */}
          <div className="flex animate-none motion-safe:animate-[marquee_38s_linear_infinite]">
            {items.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="display shrink-0 px-8 text-step-3 text-content-dim transition-colors duration-300 hover:text-blue"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------- fit notes */

/**
 * Testimonials as "fit notes": each quote seats against the project it refers
 * to, rather than floating free in a carousel of praise.
 */
export function FitNotes() {
  const [open, setOpen] = useState(0);

  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <Eyebrow>Fit notes</Eyebrow>
      <SectionHeading
        roman="What clients said"
        italic="afterwards"
        className="mt-4 max-w-[20ch]"
      />

      <ul className="mt-12 border-t border-rule">
        {TESTIMONIALS.map((t, i) => {
          const isOpen = open === i;
          return (
            <li key={t.name} className="border-b border-rule">
              <button
                className="flex w-full items-baseline justify-between gap-6 py-6 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="mono text-content-dim">{t.project}</span>
                <span className="display flex-1 text-step-2">
                  {t.name}
                  <span className="text-content-dim"> — {t.role}</span>
                </span>
                <span
                  className="mono shrink-0 text-blue"
                  aria-hidden="true"
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.36, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="display max-w-[44ch] pb-8 text-step-2 italic">
                  “{t.quote}”
                </p>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------- articles */

/**
 * Six panels, six different routes in.
 *
 * The top row comes from beyond the left and right edges with opposite rake and
 * one arrival straight up from below the fold; the bottom row comes from the
 * lower corners with the rake reversed, and its middle card arrives from far
 * below *oversized*, shrinking into its cell rather than growing into it. No
 * two cards share a direction, an angle or a scale, so the six never read as
 * one group sliding.
 *
 * The rows overlap slightly in time rather than running one after the other,
 * which keeps the whole thing one gesture instead of two.
 *
 * Distances are viewport units, so the flight is as long on an ultrawide as it
 * is on a laptop. Below `md` the grid stacks, so the cards alternate
 * left/right down the column on shorter arcs, and each one takes its progress
 * from its own slot — see `ownPace` in the hook.
 */
const ASSEMBLY: AssemblyPlan = {
  /* Progress opens as the zone's top passes three quarters of the way down the
     screen — the moment the empty frame first shows — and closes with roughly a
     quarter of the pin still to run, so the finished section is held before the
     stage lets go. */
  start: 0.72,
  pin: 0.62,
  /* The extra height and the pin both hang off this attribute, so removing it
     the moment the flight lands turns the section back into an ordinary block
     of its own height — no runway to scroll back through. */
  collapse: { attr: "data-pin-zone", stage: "[data-pin-stage]" },
  flights: [
    /* The heading is not in this plan. It has the site's line-by-line masked
       reveal instead, the same as every other heading — see RevealHeading — so
       the eyebrow and the "All articles" button stay put around it exactly as
       they do in every other section. Only the cards fly. */

    /* --- top row ---------------------------------------------------- */
    {
      select: "[data-flight=card-0]",
      x: -70,
      y: -8,
      rotate: -17,
      scale: 0.68,
      opacity: 0.12,
      at: 0,
      span: 0.66,
      lift: true,
      ownPace: true,
      narrow: { x: -80, y: 0, rotate: -13, scale: 0.76, opacity: 0.15 },
    },
    {
      select: "[data-flight=card-1]",
      x: 6,
      y: 50,
      rotate: 14,
      scale: 0.65,
      opacity: 0.15,
      at: 0.08,
      span: 0.66,
      lift: true,
      ownPace: true,
      narrow: { x: 80, y: 6, rotate: 12, scale: 0.76 },
    },
    {
      select: "[data-flight=card-2]",
      x: 68,
      y: -14,
      rotate: 24,
      scale: 0.74,
      opacity: 0.1,
      at: 0.16,
      span: 0.66,
      lift: true,
      ownPace: true,
      narrow: { x: -80, y: -4, rotate: -15, scale: 0.76, opacity: 0.15 },
    },

    /* --- bottom row ------------------------------------------------- */
    {
      select: "[data-flight=card-3]",
      x: -62,
      y: 30,
      rotate: 20,
      scale: 0.7,
      opacity: 0.12,
      at: 0.14,
      span: 0.66,
      lift: true,
      ownPace: true,
      narrow: { x: 80, y: 4, rotate: 14, scale: 0.76, opacity: 0.15 },
    },
    {
      /* The one that comes in too big and settles down to size. */
      select: "[data-flight=card-4]",
      x: -4,
      y: 66,
      rotate: -12,
      scale: 1.16,
      opacity: 0.14,
      at: 0.22,
      span: 0.66,
      lift: true,
      ownPace: true,
      /* Not oversized on a phone: a full-width card at 1.16 would be wider
         than the screen, and clipping it would read as a mistake. */
      narrow: { x: -80, y: 0, rotate: -12, scale: 0.78, opacity: 0.15 },
    },
    {
      select: "[data-flight=card-5]",
      x: 64,
      y: 34,
      rotate: -22,
      scale: 0.72,
      opacity: 0.1,
      at: 0.3,
      span: 0.66,
      lift: true,
      ownPace: true,
      narrow: { x: 80, y: -4, rotate: 16, scale: 0.76, opacity: 0.15 },
    },
  ],
};

export function ArticlesTeaser() {
  /* Every article the studio has published. Six is the whole of lib/articles —
     if a seventh is written, this shows five and the newest, which is the
     right behaviour for a teaser; the grid is three-up so the count wants to
     stay a multiple of three. */
  const shown = ARTICLES.slice(0, 6);
  const zoneRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useScrollAssembly(zoneRef, ASSEMBLY, !reduced);

  return (
    /* The scroll zone. Taller than the stage inside it, which is what buys the
       assembly its distance; the stage un-sticks normally at the bottom, so
       the page keeps scrolling straight on into the footer.
       The pin is conditional on the viewport being tall enough to hold two
       rows of cards plus the heading. On a short laptop it would pin a stage
       taller than the screen and hold the bottom row below the fold for the
       whole sequence, so there the section stays in normal flow and takes its
       progress from its own entry instead — same flight, no pinning. Same
       below `md`, where the grid stacks. */
    <div
      ref={zoneRef}
      data-invert
      data-pin-zone
      className="relative bg-surface text-content"
    >
      <section
        data-pin-stage
        /* `clip` rather than `hidden`: it keeps a card that is still 70vw away
           from widening the page, without creating a scroll container that
           focus could scroll inside. */
        className="flex flex-col justify-center overflow-clip px-5 py-24 md:px-8 md:py-20"
      >
        {/* Above the panels, so one passing behind the title never obscures
            it — and the title stays legible for the whole flight. */}
        <div className="relative z-10 mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Writing</Eyebrow>
            <SectionHeading
              roman="Opinions we’re"
              italic="willing to defend"
              className="mt-4 max-w-[20ch]"
            />
          </div>
          <Link
            href="/articles"
            className="mono rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
          >
            All articles
          </Link>
        </div>

        {/* The frame stays put throughout: the cells keep their surface and
            the hairline grid exactly where the design has them, and the panels
            fly out of the frame and back into it. No clipping here — a panel
            has to be able to leave — which changes nothing at rest, because a
            cell is the same colour as the page behind it. */}
        <ul className="grid gap-px rounded-xl border border-rule bg-rule md:grid-cols-3">
          {shown.map((a, i) => (
            <li key={a.slug} className="bg-surface">
              <Link
                href={`/articles/${a.slug}`}
                data-flight={`card-${i}`}
                /* `bg-surface` is what makes the card a panel once it is off
                   its cell. At rest it covers the cell exactly, so it is
                   invisible — same colour, same box. */
                className="group flex h-full flex-col justify-between bg-surface p-6"
              >
                <div>
                  <p className="mono text-content-dim">
                    {a.readingMinutes} min read
                  </p>
                  <h3 className="display mt-4 text-step-2 transition-colors group-hover:text-blue">
                    {a.title}
                  </h3>
                  <p className="mt-3 text-step--1 text-content-dim">
                    {a.standfirst}
                  </p>
                </div>
                <time
                  dateTime={a.datetime}
                  className="mono mt-8 text-content-dim"
                >
                  {a.date}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
