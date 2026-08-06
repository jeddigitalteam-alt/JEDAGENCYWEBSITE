"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";
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
 * How long one full pass of the five cards takes.
 *
 * Set to travel at the services marquee's speed rather than to a round number,
 * so the two rails read as one interaction: that one covers 2828px of card in
 * 56s, or about 50px a second. Five process cards at `34vw + 1rem` come to
 * 2528px on a 1440px viewport, which is 50s at the same pace.
 */
const CYCLE_S = 50;

/**
 * The five process stages, running as a continuous marquee.
 *
 * This used to be scroll-driven: a 420vh section whose vertical progress was
 * mapped to horizontal travel, with a progress bar and a "keep scrolling"
 * prompt. That is gone entirely — the cards, their copy, their numbering and
 * their size are untouched, but they now move on their own, exactly as the
 * homepage service cards do.
 *
 * The loop is the same trick as that rail: render the five cards twice and
 * translate the track by exactly -50%, so the moment it wraps, copy two sits
 * precisely where copy one began and there is nothing to see. That only holds
 * if half the track is exactly one copy, which is why the spacing is a right
 * margin on every card rather than a flex `gap` — a gap falls between items
 * only, so a ten-card track would carry nine gaps and half of it would land a
 * few pixels short of a copy, once every cycle, forever.
 *
 * It is a CSS animation on a transform: no per-frame React, no wheel or touch
 * handling of ours, so vertical scrolling is untouched. It does not pause on
 * hover — only when the section is nowhere near the viewport, and under reduced
 * motion, where it becomes an ordinary scrollable row of the five real cards.
 */
export function ProcessTimeline() {
  const reduced = useReducedMotionPref();
  const sectionRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(true);

  /* Stop the compositor animating a strip nobody can see. Toggled by an
     observer, so this is two state changes a page rather than one a frame. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setNear(entries[0]?.isIntersecting ?? true),
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* One copy for real, one to cover the wrap. Under reduced motion there is no
     wrap to cover, so the duplicates are not rendered at all. */
  const copies = reduced ? [0] : [0, 1];

  return (
    <section ref={sectionRef} className="py-16 md:py-20">
      <div className="px-5 md:px-8">
        <Eyebrow>How we work</Eyebrow>
      </div>

      {/* `overflow-hidden` is what keeps the second copy off the page's own
          scroll width. Under reduced motion the same box becomes an ordinary
          scroller, gutter and all. */}
      <div className="mt-8 overflow-hidden motion-reduce:overflow-x-auto motion-reduce:overscroll-x-contain motion-reduce:px-5 motion-reduce:[scrollbar-width:none] md:motion-reduce:px-8 [&::-webkit-scrollbar]:hidden">
        <ol
          /* No padding of its own: the -50% wrap is measured against the
             track's whole width, so a gutter here would offset the seam. The
             reduced-motion gutter lives on the scroller above instead. */
          className="flex w-max motion-safe:animate-[marquee_var(--cycle)_linear_infinite]"
          style={{
            ["--cycle" as string]: `${CYCLE_S}s`,
            animationPlayState: near ? "running" : "paused",
          }}
        >
          {copies.flatMap((copy) =>
            STEPS.map((s, i) => {
              /* The second copy is scenery: hidden from assistive technology so
                 the five stages are announced once. Nothing inside a card is
                 focusable, so there is no tab order to correct. */
              const ghost = copy === 1;
              return (
                <li
                  key={`${copy}-${s.n}`}
                  aria-hidden={ghost || undefined}
                  /* Right margin, not gap — see the note above the component.
                     4 is the width the `gap-4` between these cards had. */
                  className="relative mr-4 w-[80vw] shrink-0 sm:w-[52vw] lg:w-[34vw]"
                >
                  <div className="h-full rounded-2xl border border-rule bg-ink-raised p-6 md:p-8">
                    <div className="flex items-baseline justify-between">
                      <span className="display text-step-4 text-blue">
                        {s.n}
                      </span>
                      <span className="mono text-content-dim">
                        {i + 1} / {STEPS.length}
                      </span>
                    </div>
                    <h3 className="display mt-6 text-step-2">{s.title}</h3>
                    <p className="mt-4 text-step--1 text-content-dim">
                      {s.body}
                    </p>
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
              );
            }),
          )}
        </ol>
      </div>
    </section>
  );
}

export default ProcessTimeline;
