"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
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
          <SectionHeading
            roman="Things we"
            italic="finished"
            className="mt-4"
          />
        </div>
        <Link
          href="/work"
          className="mono rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
        >
          All work — {WORK.length}
        </Link>
      </div>

      <div className="grid gap-x-6 gap-y-14 md:grid-cols-2">
        {shown.map((study, i) => (
          <div key={study.slug} className={i % 3 === 0 ? "md:col-span-2" : ""}>
            <WorkTile
              study={study}
              index={i}
              priority={i === 0}
              sizes={
                i % 3 === 0
                  ? "(min-width: 768px) 100vw, 100vw"
                  : "(min-width: 768px) 50vw, 100vw"
              }
            />
          </div>
        ))}
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
  const items = [...CLIENTS, ...CLIENTS];

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
        <div className="group relative flex overflow-hidden">
          <div className="flex animate-none [animation-play-state:running] group-hover:[animation-play-state:paused] motion-safe:animate-[marquee_38s_linear_infinite]">
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

export function ArticlesTeaser() {
  const shown = ARTICLES.slice(0, 3);
  return (
    <section data-invert className="bg-surface px-5 py-24 text-content md:px-8 md:py-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
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

      <ul className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule md:grid-cols-3">
        {shown.map((a) => (
          <li key={a.slug} className="bg-surface">
            <Link
              href={`/articles/${a.slug}`}
              className="group flex h-full flex-col justify-between p-6"
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
              <time dateTime={a.datetime} className="mono mt-8 text-content-dim">
                {a.date}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
