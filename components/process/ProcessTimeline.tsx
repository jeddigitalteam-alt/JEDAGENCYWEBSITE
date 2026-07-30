"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Eyebrow } from "@/components/ui/primitives";

const STEPS = [
  {
    n: "01",
    title: "Rewrite the brief",
    body: "We spend the first week turning your brief into a decision that needs making. It's the least billable and highest-leverage part of the engagement.",
    out: "A one-page brief everyone has read",
  },
  {
    n: "02",
    title: "Find the constraint",
    body: "Every project has one thing that makes it hard — a migration, a regulator, a photography budget, a launch date. We name it before designing around it.",
    out: "Constraint map and risks",
  },
  {
    n: "03",
    title: "Design in the open",
    body: "Work in progress every Friday, in the browser where possible. No reveal meetings — they concentrate all the risk into one hour.",
    out: "Weekly builds you can click",
  },
  {
    n: "04",
    title: "Build it properly",
    body: "Same team. Tokens as code, performance budget in CI, accessibility checked as we go rather than audited at the end.",
    out: "Production build and a runbook",
  },
  {
    n: "05",
    title: "Hand over the keys",
    body: "Documentation written for the person who joins your team next year, not for us. Then a check-in at thirty days.",
    out: "Docs, training, 30-day review",
  },
];

/**
 * Horizontal process timeline. Vertical page scroll across a tall section maps
 * to horizontal travel, and each step's piece seats into the previous one as it
 * arrives — the numbers are earned here because this genuinely is a sequence.
 *
 * Under reduced motion this becomes an ordinary vertical list. Scroll-jacking a
 * user who asked for less motion is exactly the wrong move.
 */
export function ProcessTimeline() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-72%"]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (reduced) {
    return (
      <section className="px-5 py-20 md:px-8">
        <ol className="grid gap-6">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-xl border border-rule bg-ink-raised p-6"
            >
              <p className="mono text-blue">{s.n}</p>
              <h3 className="display mt-3 text-step-2">{s.title}</h3>
              <p className="mt-3 max-w-[52ch] text-step--1 text-content-dim">
                {s.body}
              </p>
              <p className="mono mt-4 text-content-dim">Output — {s.out}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <div ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="px-5 md:px-8">
          <Eyebrow>How we work</Eyebrow>
        </div>

        <motion.ol style={{ x }} className="mt-8 flex w-max gap-4 px-5 md:px-8">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="relative w-[80vw] shrink-0 sm:w-[52vw] lg:w-[34vw]"
            >
              <div className="h-full rounded-2xl border border-rule bg-ink-raised p-6 md:p-8">
                <div className="flex items-baseline justify-between">
                  <span className="display text-step-4 text-blue">{s.n}</span>
                  <span className="mono text-content-dim">
                    {i + 1} / {STEPS.length}
                  </span>
                </div>
                <h3 className="display mt-6 text-step-2">{s.title}</h3>
                <p className="mt-4 text-step--1 text-content-dim">{s.body}</p>
                <p className="mono mt-8 border-t border-rule pt-4 text-content-dim">
                  Output — {s.out}
                </p>
              </div>

              {/* knob + socket: each card seats into the next */}
              {i < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-2 top-1/2 h-10 w-4 -translate-y-1/2 rounded-r-full border-y border-r border-rule bg-ink-raised"
                />
              ) : null}
            </li>
          ))}
        </motion.ol>

        <div className="mt-10 px-5 md:px-8">
          <div className="h-px w-full bg-rule">
            <motion.div className="h-px bg-blue" style={{ width: progress }} />
          </div>
          <p className="mono mt-3 text-content-dim">Keep scrolling</p>
        </div>
      </div>
    </div>
  );
}

export default ProcessTimeline;
