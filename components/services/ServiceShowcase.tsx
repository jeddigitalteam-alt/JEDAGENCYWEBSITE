"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";
import type { Showcase, ShowcaseMedia } from "@/lib/services";

/** The site's expo-out, as Motion's tuple form of --ease-lock. */
const EASE = [0.16, 1, 0.3, 1] as const;
/** Gap between panels landing. Slight — the four should read as one arrival. */
const STEP_S = 0.09;
/** `HTMLMediaElement.HAVE_CURRENT_DATA` — a frame exists and can be shown. */
const HAVE_CURRENT_DATA = 2;

/**
 * The editorial block on a service page: a statement, the approach set beside
 * it, and the work underneath.
 *
 * Two columns of text and then four panels — the argument on the left at
 * heading size, the detail on the right at reading size, and the proof below
 * both. Text on both sides is the point of the layout: a statement with nothing
 * next to it is a poster, and paragraphs with nothing above them are a page of
 * copy.
 *
 * The four panels are separated by the page itself. No rule between them, no
 * frame around them and no field behind them — the gap is negative space, so
 * the separation costs nothing and reads as air rather than as a drawn line.
 * Every panel is the same box at the same ratio, and each piece of media covers
 * it, so the sequence keeps its alignment whatever shape the source happens to
 * be. Nothing is stretched: `object-cover` crops, it does not distort.
 *
 * Entrance is the site's own: `useInViewOnce` latches on first sight and never
 * unsets, and the panels settle out of a slight scale rather than rising into
 * place — a translate would open a gap at the seam and show the field behind
 * it. Under reduced motion the latch is immediate and every duration is zero,
 * so the whole thing is simply present.
 */
export function ServiceShowcase({ showcase }: { showcase: Showcase }) {
  const reduced = useReducedMotion();
  const { ref, seen } = useInViewOnce<HTMLDivElement>({
    immediate: reduced === true,
  });

  /* Reduced motion is handled in the transition, never in the rendered values:
     with `initial={false}` Motion writes the animate values as inline style
     during SSR, and branching those on a preference the server cannot read is a
     hydration mismatch that only appears for the people who set it. */
  const duration = reduced ? 0 : undefined;

  return (
    /* Generous on both sides — this is the page's one editorial pause, and the
       air above and below it is what separates the argument from the service
       detail that follows. */
    <section className="mx-auto w-full max-w-[120rem] py-24 md:py-32">
      <Eyebrow>Our approach</Eyebrow>

      {/* 6 / gutter / 5 rather than a plain half-and-half: the offset keeps the
          reading column off the statement's longest line and gives the pair an
          axis instead of a fold down the middle. Below `lg` the two stack —
          display type at this size in a half-width tablet column breaks to one
          word a line. */}
      <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-16">
        <SectionHeading
          roman={showcase.statement.roman}
          italic={showcase.statement.italic}
          className="max-w-[18ch] lg:col-span-6"
        />
        <div className="grid max-w-[52ch] gap-5 text-step-0 text-content-dim lg:col-span-5 lg:col-start-8 lg:pt-3">
          {showcase.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div
        ref={ref}
        /* The gap is the page showing through, not a drawn divider: no field
           behind the grid, no border around it, nothing between the panels but
           the surface itself. 12px stacked, 16px once they sit two across. */
        className="mt-16 grid gap-3 sm:grid-cols-2 md:mt-24 md:gap-4"
      >
        {showcase.media.map((media, i) => (
          <ShowcasePanel
            key={media.src}
            media={media}
            seen={seen}
            /* Behind the panel before it, so the sequence reads left to right
               and down rather than four things appearing at once. */
            delay={reduced ? 0 : i * STEP_S}
            duration={duration}
            reduced={reduced === true}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * One panel. A fixed box at a shared ratio, filled by whatever it holds.
 *
 * Square, because three of the four sources are — including the clip, whose
 * phone stands the full height of its frame and loses its top and bottom to
 * any landscape box. Only the one landscape still is cropped, and it is cropped
 * at the sides, where its composition already runs off the edge. A per-panel
 * ratio would fit every source and lose the alignment that makes four panels
 * read as one sequence, which is the thing worth keeping.
 */
function ShowcasePanel({
  media,
  seen,
  delay,
  duration,
  reduced,
}: {
  media: ShowcaseMedia;
  seen: boolean;
  delay: number;
  duration: number | undefined;
  reduced: boolean;
}) {
  return (
    /* `rounded-xl` is the radius every other piece of media on this site
       carries — the work tiles and the article figures both. `bg-surface-raised`
       is only what sits under a picture that has not decoded yet; it follows
       the surface, so it is a near-paper here and the same ink-raised as before
       anywhere dark. Neither is a card: there is no border, no shadow, and once
       the media loads the panel is entirely the media. */
    <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-raised">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={seen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
        transition={{ duration: duration ?? 0.9, delay, ease: EASE }}
      >
        {media.kind === "image" ? (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            /* Two across from `sm`, one below it. The widest the panel ever
               gets is half of the 120rem container. */
            sizes="(min-width: 640px) 50vw, 100vw"
            loading="lazy"
            className="object-cover"
          />
        ) : (
          <ShowcaseVideo media={media} seen={seen} reduced={reduced} />
        )}
      </motion.div>
    </div>
  );
}

/**
 * The moving panel. Silent, looping, no controls — it is a piece of the grid,
 * not a player.
 *
 * Two things worth knowing. It fades in on its first decoded frame rather than
 * being painted immediately, because a video element with nothing decoded yet
 * is a black rectangle and a black rectangle appearing in a grid of artwork is
 * the flash this avoids; the panel's own surface sits behind it until then.
 * And it only asks for the whole file once the grid has been reached — before
 * that it fetches metadata, so a visitor who never scrolls this far never pays
 * for it.
 *
 * `autoPlay` is on the element in both directions, so the server and the
 * client render the same markup. The preference is applied afterwards, in an
 * effect and in a `play` handler: a looping clip is exactly the sort of
 * unrequested movement the preference is asking us to stop, so under reduced
 * motion it holds on its first frame instead. That is also why the upgrade to
 * a full fetch hangs off `seen` rather than off playback — reduced motion
 * latches `seen` on mount, so the frame still arrives to be held.
 */
function ShowcaseVideo({
  media,
  seen,
  reduced,
}: {
  media: Extract<ShowcaseMedia, { kind: "video" }>;
  seen: boolean;
  reduced: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [decoded, setDecoded] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    /* The element is server-rendered, so the browser starts loading it while
       React is still hydrating and `loadeddata` can fire before the handler
       below exists — an event with no listener is simply gone, and the panel
       would then stay faded out with a decoded frame behind it. `readyState`
       is that same fact as state rather than as an event. */
    if (el.readyState >= HAVE_CURRENT_DATA) setDecoded(true);
    if (reduced) {
      el.autoplay = false;
      el.pause();
    } else if (seen) {
      // Autoplay is declared on the element; this covers the case where the
      // browser declined it while the panel was off screen.
      void el.play().catch(() => {});
    }
  }, [reduced, seen]);

  return (
    <video
      ref={videoRef}
      /* Encoded on the way in. The paths are plain today, and a media element
         is the one place nothing does this for you — `next/image` encodes what
         it is given, a bare `src` is taken literally. `encodeURI` is a no-op on
         a clean path and covers the first one that is not. */
      src={encodeURI(media.src)}
      aria-label={media.label}
      autoPlay
      muted
      loop
      playsInline
      preload={seen ? "auto" : "metadata"}
      onLoadedData={() => setDecoded(true)}
      /* The handler is rebuilt on every render, so it always reads the current
         preference — no ref needed to keep it fresh. */
      onPlay={(e) => {
        if (reduced) e.currentTarget.pause();
      }}
      className={`h-full w-full object-cover transition-opacity duration-500 ${
        decoded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

export default ServiceShowcase;
