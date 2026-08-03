"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SERVICES } from "@/lib/services";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";

const SHOWN = SERVICES.slice(0, 5);
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Readability scrim, painted over the art.
 *
 * Weighted to the bottom third, where the title and description sit, and kept
 * deliberately thin across the middle so the picture keeps its colour rather
 * than flattening to near-black. The small lift at the very top is only there
 * to hold the card number, which sits on whatever the image happens to be
 * doing in that corner — on the identity card that is bright blue.
 */
const SCRIM =
  "linear-gradient(to bottom," +
  "rgba(10,10,13,0.50) 0%," +
  "rgba(10,10,13,0.14) 18%," +
  "rgba(10,10,13,0.20) 44%," +
  "rgba(10,10,13,0.62) 72%," +
  "rgba(10,10,13,0.93) 100%)";

/**
 * Card artwork, keyed by slug so it cannot drift out of order if the service
 * list is ever reordered. Files live under a plain lowercase path because Next
 * 404s a literal & in a static route -- the folder they arrived in is not servable.
 *
 * All five are 1536x1024 (3:2). They now fill the whole card, and every card
 * shape the panel takes — resting, hovered, tablet, mobile — is narrower than
 * 3:2, so object-cover always fits to height and crops horizontally only. That
 * makes the vertical half of object-position inert, and the horizontal half the
 * only thing worth tuning: at rest a panel shows barely a third of the image's
 * width, so each one is centred on its own subject (the identity card, the
 * screen, the dashboard) instead of wherever the middle happens to land. They
 * also sit so the lettering inside each shot lands whole in the resting crop
 * rather than being sliced mid-word; hovering only ever widens the window, so
 * what reads cleanly at rest still reads cleanly expanded.
 */
const ART: Record<string, { src: string; position: string; alt: string }> = {
  "brand-identity": {
    src: "/work/services/brand-identity.png",
    position: "40% 50%",
    alt: "A printed identity system: blue cards, a type specimen and a guidelines document",
  },
  "web-design": {
    src: "/work/services/web-design.png",
    position: "44% 50%",
    alt: "A website design shown on a laptop under coloured studio lighting",
  },
  "web-development": {
    src: "/work/services/web-development.png",
    position: "37% 50%",
    alt: "A laptop surrounded by a code editor, build output and performance scores",
  },
  "digital-product-design": {
    src: "/work/services/digital-product-design.png",
    position: "35% 50%",
    alt: "A product dashboard on a tablet, with a phone and a design system panel",
  },
  "motion-video": {
    src: "/work/services/motion-video.png",
    position: "37% 50%",
    alt: "A video edit timeline with the finished frame previewed alongside it",
  },
};

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
        className="flex flex-col gap-1 md:h-[32rem] md:flex-row"
        onMouseLeave={() => setHovered(null)}
      >
        {SHOWN.map((service, i) => {
          const art = ART[service.slug];
          return (
            <motion.li
              key={service.slug}
              /* min-height, not height: the track is a column on mobile, where
                 the animated `flex` resolves to flex-basis on the height axis
                 and would override a plain height, collapsing the card to its
                 text. min-height outranks flex-basis, so the card keeps its
                 shape. Above md the row's own height takes over. */
              className="group relative min-h-[20rem] min-w-0 overflow-hidden rounded-xl border border-rule bg-ink-raised md:min-h-0"
              style={{ flex: 1 }}
              animate={{ flex: flexFor(i) }}
              transition={{ duration: 0.5, ease: EASE }}
              onMouseEnter={() => setHovered(i)}
            >
              {/* Art and scrim are card-level layers, not part of the link's
                  flow, so the copy below keeps exactly the position it had.
                  The panel is overflow-hidden and rounded, which is what clips
                  both of them while the flex width animates. */}
              {art && (
                <>
                  <Image
                    src={art.src}
                    alt={art.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 40vw"
                    className={
                      reduced
                        ? "object-cover"
                        : "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
                    }
                    style={{ objectPosition: art.position }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ backgroundImage: SCRIM }}
                  />
                </>
              )}

              {/* Fills the card rather than using h-full: the card's height
                  comes from min-height (mobile) or the row (desktop), and
                  percentage heights resolve to auto against min-height, which
                  left the copy stranded in the middle of the card on mobile
                  instead of sitting at its foot. */}
              <Link
                href={`/services/${service.slug}`}
                className="absolute inset-0 flex flex-col justify-between p-5 focus-visible:outline-offset-[-3px]"
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
                      // Still lifts on hover, but rests high enough to stay
                      // legible over a picture rather than over flat panel.
                      opacity: reduced || hovered === i ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {service.summary}
                  </motion.span>
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

export default ServicesPanels;
