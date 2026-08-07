"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "@/lib/services";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";
import { useMarqueeRail } from "@/lib/hooks/useMarqueeRail";

const SHOWN = SERVICES.slice(0, 5);

/**
 * Travel rate, in px a second.
 *
 * This used to be a fixed 56s cycle, which was tuned against a track that was
 * about 2830px at desktop size — near 50px a second. The cards are no longer a
 * fixed share of the viewport width (see the card sizing below), so a fixed
 * number of seconds would mean a different speed at every window size, which is
 * what the old constant already quietly did: the same 56s ran the rail at about
 * 120px/s on an ultrawide. Stating the pace instead and deriving the seconds
 * from the measured track holds the tuned speed everywhere.
 *
 * Deliberately slower than the clients marquee: these cards are an order of
 * magnitude larger and carry a picture, a title and a sentence each, so they
 * need time to be read rather than recognised.
 */
const PX_PER_SECOND = 50.5;

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
 * Five service cards, running as a continuous marquee.
 *
 * This now lives inside the hero rather than as the section below it, so that
 * the cards are already moving on the first screen. Structurally that means it
 * is a plain block, not a `<section>` with its own page padding: the hero owns
 * the gutter and this breaks out of it to run edge to edge, and its height is
 * whatever the hero has left between the call to action and the standfirst —
 * see the `h-full` on the cards and the flex column that feeds it.
 *
 * Card width is untouched at 39vw. That is the size the old hover-expanding
 * panel only reached when you hovered it: it gave the hovered card `flex: 2.2`
 * against a total of 5.32, which on a 1440px viewport worked out at 562px. The
 * height is the one thing that had to give — a 32rem card cannot sit under a
 * headline and a CTA inside one screen — so the cards are landscape here. The
 * artwork, its crops, the scrim, the numbering and the copy are all unchanged;
 * `object-cover` simply fits to width now instead of to height.
 *
 * The loop is the clients marquee's trick, scaled up: render the five cards
 * twice and translate the track by exactly -50%, so the moment it wraps, copy
 * two is sitting precisely where copy one began and there is nothing to see.
 * That only holds if half the track is exactly one copy, which is why the
 * spacing is a right margin on every card rather than a flex `gap` — a gap
 * falls between items only, so a ten-card track would carry nine gaps and half
 * of it would land 2px short of a copy, once every cycle, forever.
 *
 * It is a CSS animation on a transform, so at rest there is no per-frame work
 * of any kind. `useMarqueeRail` adds two things on top of it: the cycle length,
 * derived from the measured track so the pace holds at every card size, and a
 * temporary speed-up from horizontal wheel, trackpad and touch input. Vertical
 * scrolling is never claimed — see the hook. It does not pause on hover, only
 * when it is nowhere near the viewport, and under reduced motion, where it
 * becomes an ordinary scrollable row of the five real cards.
 *
 * There is no visible control. The rail can be grabbed and thrown — see
 * `useMarqueeRail` — and that is the whole of its interface.
 */
export function ServicesPanels() {
  const reduced = useReducedMotionPref();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(true);
  const { viewportRef, trackRef } = useMarqueeRail<HTMLDivElement, HTMLUListElement>({
    enabled: !reduced,
    pxPerSecond: PX_PER_SECOND,
  });

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
    /* `min-h-0` is what lets this shrink inside the hero's flex column — a flex
       item's default `min-height: auto` would refuse to go below its content
       and push the standfirst off the screen instead. The floor and ceiling
       below keep the cards usable on a short laptop and stop them ballooning on
       a tall monitor. */
    /* No heading row. The label, the title and the "All services" pill have
       all been taken out — the cards speak for themselves under the hero, and
       a lone button with nothing above it would have been left floating. The
       space they occupied is gone with them rather than left behind: this
       block's top padding is now the only gap between the CTA and the strip,
       and the rail takes the rest. */
    <div
      ref={sectionRef}
      className="flex min-h-0 flex-1 flex-col justify-end pt-8 md:pt-10"
    >
      {/* Breaks the hero gutter so the strip runs edge to edge and clips at both
          sides as it loops. `overflow-hidden` is what keeps the second copy off
          the page's own scroll width. Under reduced motion the same box becomes
          an ordinary scroller.

          The rail takes its height from the cards now, rather than the cards
          taking their size from it. The card width is a share of the viewport
          and its height follows from the ratio, so the number of cards on
          screen is the same at every desktop width instead of drifting with
          the window's proportions — see the card below. */}
      <div
        ref={viewportRef}
        className="-mx-5 flex shrink-0 overflow-hidden touch-pan-y md:-mx-8 motion-reduce:overflow-x-auto motion-reduce:overscroll-x-contain motion-reduce:px-5 motion-reduce:[scrollbar-width:none] md:motion-reduce:px-8 [&::-webkit-scrollbar]:hidden"
      >
        <ul
          ref={trackRef}
          /* `shrink-0` is load-bearing. The rail is a flex row, so the track is
             a flex item, and a flex item's default `flex-shrink: 1` pulled the
             measured width the hook sets back down to the width of the rail —
             1440px against a real track of 3734px, which left `-50%` moving the
             cards at two fifths of their proper speed. */
          className="flex w-max shrink-0 motion-safe:animate-[marquee_var(--cycle)_linear_infinite]"
          style={{
            /* A placeholder only. The real value is measured from the track and
               written to this same custom property by `useMarqueeRail`; this
               keeps the animation valid for the frame before that lands. */
            ["--cycle" as string]: "56s",
            animationPlayState: near ? "running" : "paused",
          }}
        >
          {copies.flatMap((copy) =>
            SHOWN.map((service, i) => {
              const art = ART[service.slug];
              /* The second copy is scenery: hidden from assistive technology
                 and out of the tab order, so the five services are announced
                 once and there is one link per service. */
              const ghost = copy === 1;
              return (
                <li
                  key={`${copy}-${service.slug}`}
                  aria-hidden={ghost || undefined}
                  /* Right margin, not gap — see the note above the component.

                     **Width is a share of the viewport, height follows from the
                     ratio.** Stated that way round, the number of cards on
                     screen is a property of the design rather than an accident
                     of the window: 29vw is a shade under three and a half cards
                     in view at every desktop width, from a 1280 laptop to a 3440
                     ultrawide. The previous arrangement derived the width from
                     whatever height the hero had spare, so a wide short window
                     and a narrow tall one disagreed — cards capped at 740px on a
                     3440 display, which is 4.6 in view and reads as small.

                     Three steps rather than a single `clamp()`, because the
                     right answer is not continuous: a phone wants one card and
                     a bit, a tablet wants two and a bit, and a desktop wants
                     three and a half. A clamp between those would pass through
                     awkward middles.

                       base   88vw   ~1.1 cards   (390px -> 343px card)
                       sm     44vw   ~2.3 cards   (768px -> 338px card)
                       lg     29vw   ~3.4 cards   (1920px -> 557px card)

                     16/9 rather than the artwork's own 3:2 because these are
                     landscape cards sitting under a headline, and 3:2 is taller
                     than the hero can spare on a laptop. The crop it asks of the
                     picture is a consistent 16% off the height, taken evenly top
                     and bottom, and it matches the featured work tile's
                     `lg:aspect-[16/9]`. */
                  className="group relative mr-1 aspect-[16/9] w-[88vw] shrink-0 self-start overflow-hidden rounded-xl border border-rule bg-ink-raised sm:w-[44vw] lg:w-[29vw]"
                >
                {/* Art and scrim are card-level layers, not part of the link's
                    flow, so the copy keeps exactly the position it had. */}
                {art && (
                  <>
                    <Image
                      src={art.src}
                      alt={art.alt}
                      fill
                      /* Matches the card widths exactly, so the browser picks a
                         source for the box it will actually be drawn into
                         rather than over-fetching. */
                      sizes="(min-width: 1024px) 29vw, (min-width: 640px) 44vw, 88vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-within:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                      style={{ objectPosition: art.position }}
                      draggable={false}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{ backgroundImage: SCRIM }}
                    />
                  </>
                )}

                {/* Fills the card rather than using h-full: percentage heights
                    resolved to auto against the old min-height and left the
                    copy stranded mid-card. */}
                <Link
                  href={`/services/${service.slug}`}
                  className="absolute inset-0 flex flex-col justify-between p-5 focus-visible:outline-offset-[-3px]"
                  draggable={false}
                  tabIndex={ghost ? -1 : undefined}
                >
                  <span className="mono text-content-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="mt-8 block md:mt-0">
                    <span className="display block text-step-2 transition-colors group-hover:text-blue">
                      {service.name}
                    </span>
                    {/* Rests a shade down and lifts on hover, as before — high
                        enough to stay legible over a picture either way. */}
                    <span className="mt-3 block max-w-[34ch] text-step--1 text-content-dim opacity-80 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:opacity-100">
                      {service.summary}
                    </span>
                  </span>
                </Link>
                </li>
              );
            }),
          )}
        </ul>
      </div>

    </div>
  );
}

export default ServicesPanels;
