"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";
import type { ShowcaseMedia } from "@/lib/services";

/** The site's expo-out, as Motion's tuple form of --ease-lock. */
const EASE = [0.16, 1, 0.3, 1] as const;
/** Gap between panels landing. Slight — the four should read as one arrival. */
const STEP_S = 0.09;
/** `HTMLMediaElement.HAVE_CURRENT_DATA` — a frame exists and can be shown. */
const HAVE_CURRENT_DATA = 2;

export type { ShowcaseMedia };

/**
 * Four panels of work, two across.
 *
 * This was the bottom half of `ServiceShowcase` and is now its own component,
 * because three places want the same treatment: the merged web page, the UX and
 * UI page, and /work. Nothing about it changed on the way out — same grid, same
 * gaps, same radius, same square panels, same entrance — so the page it came
 * from renders identically.
 *
 * The four panels are separated by the page itself. No rule between them, no
 * frame around them and no field behind them — the gap is negative space, so
 * the separation costs nothing and reads as air rather than as a drawn line.
 * That is also why it belongs on a light surface: on paper the gutters are the
 * page showing through, which is the whole idea. /work sets `[data-invert]` on
 * the section for exactly that reason rather than reaching for a white of its
 * own.
 *
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
export function ShowcaseGrid({
  media,
  ratio = "aspect-square",
  className = "",
}: {
  media: ShowcaseMedia[];
  /**
   * The shared tile ratio, as a Tailwind aspect class. Square by default,
   * which is what every grid used before this existed.
   *
   * It is one ratio for all four on purpose — a per-panel ratio would fit every
   * source perfectly and lose the alignment that makes four panels read as one
   * sequence. What this allows is choosing that one ratio to suit the set: a
   * grid of landscape sources loses a fifth of its width to a square tile, and
   * `aspect-[5/4]` gives it back.
   */
  ratio?: string;
  /** Outer spacing. The grid itself owns nothing above or below it. */
  className?: string;
}) {
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
    <div
      ref={ref}
      /* The gap is the page showing through, not a drawn divider: no field
         behind the grid, no border around it, nothing between the panels but
         the surface itself. 12px stacked, 16px once they sit two across.

         `w-full max-w-full min-w-0` is belt and braces rather than a fix.
         Measured at 1920/1440/1366/1024/768/390 the grid is already exactly its
         parent's content box, with equal gutters both sides and no document
         overflow — `sm:grid-cols-2` compiles to `repeat(2, minmax(0, 1fr))`, so
         the columns cannot be forced wider than their share by their contents,
         and `box-sizing: border-box` is global. These three keep it that way if
         this grid is ever dropped into a flex parent, where the default
         `min-width: auto` would let a wide child push it past its container. */
      className={`grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-2 md:gap-4 ${className}`}
    >
      {media.map((item, i) => (
        <ShowcasePanel
          key={item.src}
          media={item}
          ratio={ratio}
          seen={seen}
          /* Behind the panel before it, so the sequence reads left to right
             and down rather than four things appearing at once. */
          delay={reduced ? 0 : i * STEP_S}
          duration={duration}
          reduced={reduced === true}
        />
      ))}
    </div>
  );
}

/**
 * One panel. A fixed box at a shared ratio, filled by whatever it holds.
 *
 * Square by default, because most of the sources are — including the clip on
 * the web page, whose phone stands the full height of its frame and loses its
 * top and bottom to any landscape box. Where a whole set is landscape the grid
 * says so instead, and the tile follows: a 1.25:1 source in a square tile gives
 * up a fifth of its width, which is what "cropped on the right" looks like when
 * nothing is actually overflowing.
 *
 * Landscape stills in a square tile are cropped at the sides, where their
 * compositions usually run off the edge anyway, and each may name its own
 * `position` where centring is not the right place to take that crop from.
 * Nothing is ever stretched: `object-cover` crops, it does not distort.
 */
function ShowcasePanel({
  media,
  ratio,
  seen,
  delay,
  duration,
  reduced,
}: {
  media: ShowcaseMedia;
  ratio: string;
  seen: boolean;
  delay: number;
  duration: number | undefined;
  reduced: boolean;
}) {
  return (
    /* `rounded-xl` is the radius every other piece of media on this site
       carries — the work tiles and the article figures both. `bg-surface-raised`
       is only what sits under a picture that has not decoded yet; it follows
       the surface, so it is a near-paper on an inverted section and the same
       ink-raised as before anywhere dark. Neither is a card: there is no border,
       no shadow, and once the media loads the panel is entirely the media. */
    /* `overflow-hidden` belongs here, on the tile, and nowhere above it: it is
       what gives the rounded corner something to clip the picture against. The
       section around the grid never clips. */
    <div
      className={`relative w-full min-w-0 max-w-full overflow-hidden rounded-xl bg-surface-raised ${ratio}`}
    >
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
            style={media.position ? { objectPosition: media.position } : undefined}
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

export default ShowcaseGrid;
