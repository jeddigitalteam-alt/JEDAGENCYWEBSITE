"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  useScrollAssembly,
  type AssemblyPlan,
} from "@/components/home/use-scroll-assembly";
import { CLIENTS } from "@/lib/site";
import { TESTIMONIALS } from "@/lib/team";
import { HOMEPAGE_TESTIMONIALS } from "@/lib/testimonials";
import { homepageArticles } from "@/lib/articles";
import { WORK } from "@/lib/work";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";
import TestimonialQuote from "@/components/home/TestimonialQuote";
import WorkTile from "@/components/work/WorkTile";

/* ------------------------------------------------------------------ work */

export function SelectedWork() {
  /* One project on the homepage: the written-up case study. The others are not
     removed from anywhere else — they keep their tiles on /work and inside the
     industry grids, which is where a visitor going looking for the full list
     ends up. Here the single tile runs full width, which is the shape the
     featured slot already had, so nothing reflows around a gap. */
  const study = WORK[0];
  return (
    /* Full-bleed paper, via `[data-invert]` — the site's existing light
       surface, the same one the client marquee below it uses. Nothing inside
       carries a colour of its own: the attribute reassigns the semantic tokens
       and the eyebrow, heading, tile and pill all follow, so the switch from
       the blue field it briefly ran on is one word and no restyling.

       `--accent` stays blue here, which is what keeps the tile's hover and the
       pill's border reading as the brand rather than as ink on ink. */
    <section
      data-invert
      className="bg-surface px-5 py-24 text-content md:px-8 md:py-32"
    >
      {/* The measure is shared by the heading row and the tile, so the "Recent
          work" label lines up with the left edge of the picture and the "All
          work" pill with its right edge. Centring only the media would have
          left the heading hanging off in the gutter.

          The cap is stated in `rem` rather than as a percentage because the
          problem it solves is absolute, not proportional: past a point the tile
          stops gaining presence and just gains width. 120rem is 1920px, so any
          window up to about 2000px still gets the full-bleed tile it has always
          had, and only genuinely wide displays see it settle and centre. On a
          3440 ultrawide that is 56% of the screen at 75vh tall — big enough to
          be the feature, bounded enough not to be a mural. `mx-auto` does the
          centring; the page gutter is still outside it, so the side margins
          never close up. */}
      <div className="mx-auto w-full max-w-[120rem]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Selected work</Eyebrow>
            <SectionHeading roman="Recent" italic="work" className="mt-4" />
          </div>
          <Link
            href="/work"
            className="mono rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-accent hover:text-accent"
          >
            All work — {WORK.length}
          </Link>
        </div>

        <WorkTile
          study={study}
          index={0}
          priority
          /* No "01" badge on a lone tile — a counter on a set of one only
             draws attention to the count. The badge stays on /work and the
             industry grids, which are actual sets. */
          showIndex={false}
          /* Capped at the measure above, so past 1920px the tile stops growing
             and the browser stops reaching for larger sources. */
          sizes="(min-width: 2000px) 1920px, 100vw"
          /* A fixed 4:3 box grows past the height of the viewport on any wide
             monitor — 115% at 1440px, 281% at 3440px. The ratio gives it a
             banner shape from lg up, and the max-height is the ceiling that
             ultrawide displays need. Below lg it stays 4:3, untouched.

             `mx-auto` is the fix for the off-centre tile, and the reason is
             the interaction between the two properties above it. When
             `max-h` binds, a box with an `aspect-ratio` does not just get
             shorter — it gets *narrower*, because the ratio is preserved and
             the height is now the constrained dimension. The width it gives
             back was being taken entirely off the right-hand side, since a
             block box with a computed width sits at the start of its line:

               1920x1080  frame 1575 wide in an 1856 container — 281px adrift
               3440x1440  frame 2360 wide in a 3376 container — 1016px adrift

             which is the "image on the left, empty space on the right" this
             replaces. `mx-auto` splits that remainder evenly, so the tile is
             centred whether the width or the height is the binding
             constraint.

             The `2xl:aspect-[2/1]` step is gone with it. It existed to stop the
             tile overrunning very wide monitors, which the measure cap now does
             at every size, and it was making the ultrawide case worse: a 2:1
             box hits the height ceiling sooner, so it lost more width to the
             same bug. Holding 16/9 all the way up also means the artwork keeps
             one crop instead of changing shape at 1536px. */
          frameClassName="mx-auto lg:aspect-[16/9] lg:max-h-[82vh]"
          /* The banner crop is much wider than the source, so a blind centre
             left the campaign lock-up sitting high. 45% puts its measured
             centre of mass on the middle of the frame. At the 4:3 crop used
             below lg the source is almost the same ratio, so this moves it by
             a fraction of a percent — tablet and mobile are untouched. */
          imagePosition="center 45%"
        />
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
 * Client testimonials: one heading, then every quote beneath it.
 *
 * These were two separate sections — an unheaded editorial break carrying the
 * first quote, then a headed "fit notes" section carrying the second. Read down
 * the page, the heading introduced the second quote and appeared to have
 * nothing to do with the first, which had already gone past.
 *
 * One section now. The heading belongs to the whole area, both quotes sit under
 * it in the order they were in, and each is still the same `TestimonialQuote`
 * with the same stars, sizes and entrance. Nothing about either quote, name,
 * company or role changed.
 *
 * The two sources stay separate in the data — `HOMEPAGE_TESTIMONIALS` is the
 * long-form quote, `TESTIMONIALS` the fit notes that seat against a named
 * project — because they are written differently even though they are now
 * presented together.
 */
export function Testimonials() {
  const long = HOMEPAGE_TESTIMONIALS[0];
  const note = TESTIMONIALS[0];
  const quotes = [
    long && {
      key: long.company,
      rating: long.rating,
      quote: long.quote,
      company: long.company,
      attribution: long.attribution,
    },
    note && {
      key: note.project,
      rating: note.rating,
      quote: note.quote,
      company: note.project,
      attribution: `${note.name} — ${note.role}`,
    },
  ].filter(Boolean) as {
    key: string;
    rating: number;
    quote: string;
    company: string;
    attribution: string;
  }[];

  if (!quotes.length) return null;

  return (
    /* The padding is the section: this reads as a held breath between two dense
       blocks, so it is deliberately more than the 24/32 its neighbours use. */
    <section className="px-5 py-24 md:px-8 md:py-32">
      <Eyebrow>Fit notes</Eyebrow>
      <SectionHeading
        roman="What clients said"
        italic="afterwards"
        className="mt-4 max-w-[22ch]"
      />

      {/* The gap between the quotes is larger than the gap from the heading to
          the first one, so the heading reads as belonging to the group rather
          than to the quote directly under it. */}
      <div className="mt-16 grid gap-24 md:mt-20 md:gap-32">
        {quotes.map((q) => (
          <TestimonialQuote
            key={q.key}
            rating={q.rating}
            quote={q.quote}
            company={q.company}
            attribution={q.attribution}
          />
        ))}
      </div>
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
       they do in every other section. Only the cards fly.

       Four routes, not six. They are four of the six the six-card version
       flew, kept because they were tuned: the far-left arc, the high arc from
       the right, the low arc from the left and the low arc from the right.
       Each one is now paired with a card position that suits it, and the two
       that went with the dropped cards — the from-below arc and the oversized
       one that settled down to size — went with them.

       On a phone the grid is one column, so the `narrow` variants alternate
       strictly left, right, left, right down the stack. */
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
      x: 68,
      y: -14,
      rotate: 24,
      scale: 0.74,
      opacity: 0.1,
      at: 0.08,
      span: 0.66,
      lift: true,
      ownPace: true,
      narrow: { x: 80, y: 6, rotate: 12, scale: 0.76, opacity: 0.15 },
    },
    {
      select: "[data-flight=card-2]",
      x: -62,
      y: 30,
      rotate: 20,
      scale: 0.7,
      opacity: 0.12,
      at: 0.16,
      span: 0.66,
      lift: true,
      ownPace: true,
      narrow: { x: -80, y: -4, rotate: -15, scale: 0.76, opacity: 0.15 },
    },
    {
      select: "[data-flight=card-3]",
      x: 64,
      y: 34,
      rotate: -22,
      scale: 0.72,
      opacity: 0.1,
      at: 0.24,
      span: 0.66,
      lift: true,
      ownPace: true,
      narrow: { x: 80, y: 4, rotate: 16, scale: 0.76, opacity: 0.15 },
    },
  ],
};

export function ArticlesTeaser() {
  /* The four the homepage shows, named in lib/articles rather than derived
     here. Deriving them — "everything with a picture, first four" — is a rule
     that changes its own answer: when a newer piece gained artwork it took the
     fourth slot and pushed "The brief is the deliverable" off the page, which
     was nobody's decision. Every piece still lives on /articles regardless.

     The count matters as well as the contents: the `xl` grid is four across and
     the flight plan below defines routes for card-0 to card-3, so a fifth card
     would both wrap the row and sit still while the others flew. */
  const shown = homepageArticles();
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
        {/* Two up from `md`, four across from `xl`. Four across is what keeps
            the pinned stage inside one screen: these cards carry a picture
            now, so a 2x2 at desktop width would stand about 1.7 screens tall
            and the bottom row would spend the whole flight below the fold.
            The pin is scoped to `xl` in globals.css to match, so the 2x2 case
            assembles in normal flow instead — same flight, no sticky. */}
        <ul className="grid gap-px rounded-xl border border-rule bg-rule md:grid-cols-2 xl:grid-cols-4">
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
                  {/* The artwork is 3:2 and the frame is 3:2, so `cover` has
                      nothing to crop: each poster arrives whole, lettering and
                      all, at any card width. Rounded and clipped inside the
                      card's own padding, which is what keeps it clear of the
                      grid's rounded outer corners — the frame is drawn by the
                      list, and a full-bleed picture would square those corners
                      off. No overlay: the type sits below the picture, not on
                      it, so there is nothing to rescue. */}
                  <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-ink-raised">
                    <Image
                      src={a.image!.src}
                      alt={a.image!.alt}
                      fill
                      sizes="(min-width: 1280px) 22vw, (min-width: 768px) 44vw, 88vw"
                      /* `motion-safe:` on the scale — Tailwind v4 compiles
                         `scale-*` to the standalone `scale` property, which the
                         `transform-none` that used to sit here does not cancel,
                         so the hover was still scaling for readers who had
                         asked for no movement. Same fix as ArticleMedia. */
                      className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </div>
                  <p className="mono mt-5 text-content-dim">
                    {a.readingMinutes} min read
                  </p>
                  <h3 className="display mt-3 text-step-2 transition-colors group-hover:text-blue">
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
