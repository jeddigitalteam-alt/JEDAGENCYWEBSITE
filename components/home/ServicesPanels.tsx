"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { SERVICES } from "@/lib/services";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";

const SHOWN = SERVICES.slice(0, 5);
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Five interlocking panels. Hovering one expands it and pushes its
 * neighbours — they share a flex track, so the panels are physically
 * connected and the widths always resolve to the same total.
 *
 * Touch and keyboard: panels are plain links at equal width. Nothing here
 * depends on hover to be reachable or readable.
 */
export function ServicesPanels() {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  const flexFor = (i: number) => {
    if (reduced || hovered === null) return 1;
    if (i === hovered) return 2.2;
    // Immediate neighbours give up the most room — they're the ones being pushed.
    return Math.abs(i - hovered) === 1 ? 0.72 : 0.84;
  };

  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>What we do</Eyebrow>
          <SectionHeading
            roman="Five things, done"
            italic="properly"
            className="mt-4 max-w-[18ch]"
          />
        </div>
        <Link
          href="/services"
          className="mono rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
        >
          All services
        </Link>
      </div>

      <ul
        className="flex flex-col gap-1 md:h-[26rem] md:flex-row"
        onMouseLeave={() => setHovered(null)}
      >
        {SHOWN.map((service, i) => (
          <motion.li
            key={service.slug}
            className="group relative min-w-0 overflow-hidden rounded-xl border border-rule bg-ink-raised"
            style={{ flex: 1 }}
            animate={{ flex: flexFor(i) }}
            transition={{ duration: 0.5, ease: EASE }}
            onMouseEnter={() => setHovered(i)}
          >
            <Link
              href={`/services/${service.slug}`}
              className="flex h-full flex-col justify-between p-5 focus-visible:outline-offset-[-3px]"
              onFocus={() => setHovered(i)}
            >
              <span className="mono text-content-dim">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="mt-8 block md:mt-0">
                <span className="display block text-step-2 transition-colors group-hover:text-blue">
                  {service.name}
                </span>
                <motion.span
                  className="mt-3 block max-w-[34ch] text-step--1 text-content-dim"
                  animate={{
                    opacity: reduced || hovered === i ? 1 : 0.35,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {service.summary}
                </motion.span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

export default ServicesPanels;
