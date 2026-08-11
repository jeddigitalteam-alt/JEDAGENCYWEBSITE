"use client";

import { motion, useReducedMotion } from "motion/react";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface JourneyStage {
  label: string;
  body: string;
}

/**
 * The client journey: four stages on one line.
 *
 * The page's one scroll moment, and it earns its place by being the only thing
 * here that is genuinely sequential — a rule draws left to right and the stages
 * arrive along it, so the section reads as a direction of travel rather than
 * four boxes. Everything else on the page uses the shared heading reveal and
 * nothing else moves.
 *
 * The line is a `scaleX` on a hairline and the stages are opacity and a few
 * pixels of `y`. Nothing here touches layout, and under reduced motion the
 * whole thing is simply present — the rule at full width, the stages at rest —
 * because a sequence you cannot see arrive is still a sequence.
 */
export function AboutJourney({ stages }: { stages: JourneyStage[] }) {
  const reduced = useReducedMotion();
  const { ref, seen } = useInViewOnce<HTMLDivElement>({
    immediate: reduced === true,
  });
  const duration = reduced ? 0 : undefined;

  return (
    <div ref={ref} className="mt-16 md:mt-20">
      {/* The rule the stages hang from. Horizontal on desktop where the four
          sit side by side; on a phone the stages stack, so it becomes the
          top edge of the first one and the line would be drawing across a
          single column — it is hidden there rather than reinterpreted. */}
      <motion.div
        aria-hidden="true"
        className="hidden h-px origin-left bg-rule md:block"
        initial={false}
        animate={{ scaleX: seen ? 1 : 0 }}
        transition={{ duration: duration ?? 1.1, ease: EASE }}
      />

      <ol className="grid gap-10 md:grid-cols-4 md:gap-8">
        {stages.map((stage, i) => (
          <motion.li
            key={stage.label}
            className="border-t border-rule pt-6 md:border-t-0 md:pt-8"
            initial={false}
            animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            /* Behind the rule, and each stage behind the one before it, so the
               eye is led along rather than shown four things at once. */
            transition={{
              duration: duration ?? 0.7,
              delay: reduced ? 0 : 0.18 + i * 0.12,
              ease: EASE,
            }}
          >
            <p className="mono text-content-dim">
              {String(i + 1).padStart(2, "0")}
            </p>
            {/* Deliberately NOT through RevealHeading. The stage is already
                rising and fading as part of the sequence above, staggered on
                the site's own curve; a masked line reveal inside it would be a
                second entrance animating the same words on a different clock.
                One movement per element. */}
            <h3 className="display mt-4 text-step-2">{stage.label}</h3>
            <p className="mt-3 text-step--1 text-content-dim">{stage.body}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export default AboutJourney;
