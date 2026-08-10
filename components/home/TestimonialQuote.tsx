"use client";

import { motion, useReducedMotion } from "motion/react";
import RevealHeading from "@/components/motion/RevealHeading";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Gap between stars landing. Fast enough to read as one gesture. */
const STAR_STEP_S = 0.08;

/**
 * A single star, at the size the rating wants rather than a glyph at whatever
 * size the font decides. Drawn rather than typed so it takes `currentColor` and
 * cannot be substituted by a fallback font — "★" is exactly the sort of
 * character that renders differently on Windows and iOS.
 */
export function Star({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 1.8l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.56l-6.18 3.25L7 13.94l-5-4.87 6.91-1L12 1.8z" />
    </svg>
  );
}

export interface TestimonialQuoteProps {
  /** Out of five. Rendered as that many filled stars. */
  rating: number;
  quote: string;
  /** The client, given the weight of a name. */
  company: string;
  /** Person and role, as one line — "Tom — Founder & CEO". */
  attribution: string;
}

/**
 * A quote, given the whole width and a great deal of air.
 *
 * No card, no box, no shadow, no carousel and nothing to advance. One quote
 * presented properly says more than a rotating set of three.
 *
 * Extracted from `Testimonial` so the fit note further down the page is the
 * same component rather than a second thing that resembles it. The two sections
 * differ in what sits above them — the fit note keeps its eyebrow and heading —
 * and in nothing else: same stars, same measure, same sizes, same entrance.
 *
 * The quote runs through `RevealHeading`, the line-by-line masked entrance every
 * heading on the site uses, so it plays once on the way down and stays put. The
 * stars land first and the attribution follows, both driven by `useInViewOnce`,
 * which latches on first sight and never unsets.
 */
export function TestimonialQuote({
  rating,
  quote,
  company,
  attribution,
}: TestimonialQuoteProps) {
  const reduced = useReducedMotion();
  /* Reduced motion latches immediately, so the content is simply there rather
     than waiting on a scroll trigger it has no entrance for. */
  const { ref, seen } = useInViewOnce<HTMLDivElement>({
    immediate: reduced === true,
  });

  /* Reduced motion is handled in the *transition*, never in the rendered
     values. With `initial={false}` Motion writes the `animate` values as inline
     style during SSR, so branching what is animated to on `useReducedMotion()`
     makes the server (which reads `null`) and the client (which reads `true`)
     emit different style attributes — a hydration mismatch that appears only
     for the readers who set the preference. Duration is not rendered, so
     zeroing it here is free. */
  const duration = reduced ? 0 : undefined;

  return (
    <div ref={ref} className="max-w-[75rem]">
      {/* Rating. One label for assistive technology, and the stars hidden from
          it — five identical announcements would be noise. */}
      <p className="sr-only">{rating} out of 5 stars</p>
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: rating }, (_, i) => (
          <motion.span
            key={i}
            className="block text-blue"
            initial={false}
            animate={
              seen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }
            }
            transition={{
              duration: duration ?? 0.42,
              /* The one-by-one landing: each star waits its index out. */
              delay: seen && !reduced ? i * STAR_STEP_S : 0,
              ease: EASE,
            }}
          >
            <Star className="h-[22px] w-[22px]" />
          </motion.span>
        ))}
      </div>

      {/* The quote carries no quotation marks: at this size the type is doing
          that job, and a pair of primes would be the largest thing on screen.
          `text-step-4` lands around 79px at 1440 and caps at 88px; `.display`
          runs a 0.92 line height, so the lines close up the way an editorial
          pull quote should. */}
      {/* `<blockquote>` wrapping a `<p>` rather than RevealHeading rendering the
          blockquote itself: its `as` is deliberately limited to the elements a
          heading can be, and widening it for one caller would weaken that
          everywhere else. The quotation stays correctly marked up and the
          reveal is unchanged. */}
      <blockquote className="mt-10 md:mt-12">
        <RevealHeading
          as="p"
          className="display max-w-[20ch] text-step-4"
          roman={quote}
        />
      </blockquote>

      <motion.div
        className="mt-14 md:mt-20"
        initial={false}
        animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        /* Behind the quote's own reveal, so it reads as the closing beat of one
           entrance rather than a second, competing one. */
        transition={{
          duration: duration ?? 0.7,
          delay: reduced ? 0 : 0.35,
          ease: EASE,
        }}
      >
        <p className="text-step-1 text-content">{company}</p>
        {/* Not `.mono`. That class uppercases, which is right for the site's
            utility labels but turns a person's name into "RICHARD — FOUNDER".
            This is a name, so it keeps the capitalisation it was written with
            and takes its muted tone from the token instead. */}
        <p className="mt-2 text-step--1 text-content-dim">{attribution}</p>
      </motion.div>
    </div>
  );
}

export default TestimonialQuote;
