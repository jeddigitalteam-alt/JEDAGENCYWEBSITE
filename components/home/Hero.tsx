"use client";

import { motion } from "motion/react";
import { useIntro } from "@/components/motion/intro-context";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero. Mounted behind the loader from the first paint, and cued by
 * `introDone` — so the panels parting and this animating in are one move.
 *
 * TODO(assets): the brief calls for a full-bleed muted background video here.
 * No video asset exists yet; see NOTES.md.
 */
export function Hero() {
  const { introDone, shouldRun } = useIntro();

  // While the client is still deciding (shouldRun === null) hold the pre-state
  // so nothing flashes in front of the loader.
  const show = shouldRun === false || introDone;

  const rise = {
    initial: { y: "110%" },
    animate: show ? { y: "0%" } : { y: "110%" },
  };

  return (
    <section className="relative flex min-h-svh flex-col justify-between overflow-hidden px-5 pb-8 pt-28 md:px-8 md:pb-10">
      {/* eyebrow */}
      <motion.div
        className="mono flex items-baseline gap-3 text-content-dim"
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
      >
        <span>London, UK</span>
        <span aria-hidden="true" className="h-px w-8 bg-rule" />
        <span>51.5074° N</span>
      </motion.div>

      <h1 className="display max-w-[22ch] text-hero">
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

      <div className="flex items-end justify-between gap-6">
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
