"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { hasCaseStudy, type CaseStudy } from "@/lib/work";

/**
 * Work tile. Plays a silent looping video on hover where one exists, and
 * otherwise animates the still.
 *
 * TODO(assets): no case-study videos exist yet. `videoSrc` is wired end to end
 * so dropping an mp4 into public/work/<slug>/ and adding the path in lib/work.ts
 * is the only change needed. Until then the still gets a slow scale instead.
 */
export function WorkTile({
  study,
  index,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  videoSrc,
  frameClassName = "",
  imagePosition,
  showIndex = true,
}: {
  study: CaseStudy;
  index: number;
  priority?: boolean;
  sizes?: string;
  videoSrc?: string;
  /**
   * The "01" badge in the corner of the frame. Off where the tile is not part
   * of a set — a number on a single card reads as a count of one rather than
   * as a position in a sequence.
   */
  showIndex?: boolean;
  /**
   * Extra classes for the image frame. Used by the full-width featured tile to
   * widen its aspect ratio on large screens — at a fixed 4:3 a full-bleed tile
   * is taller than the viewport on any wide monitor. Defaults to nothing, so
   * every other tile keeps the plain 4:3 box.
   */
  frameClassName?: string;
  /**
   * `object-position` for the thumbnail. Only needed where the frame is much
   * wider than the source and a blind centre crop leaves the subject sitting
   * off-centre. Omit to centre.
   */
  imagePosition?: string;
}) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onEnter = () => {
    setHovered(true);
    if (videoSrc && !reduced) videoRef.current?.play().catch(() => {});
  };
  const onLeave = () => {
    setHovered(false);
    videoRef.current?.pause();
  };

  /* Studies without a case-study page render as a plain <div>: no href, no
     hover handlers and no `group`, so the image never scales
     and the title never turns blue. Nothing that implies navigation survives,
     and there is no tab stop — but the card itself is visually identical. */
  const linked = hasCaseStudy(study);
  const Wrapper = linked ? Link : "div";
  const wrapperProps = linked
    ? {
        href: `/work/${study.slug}`,
        className: "group block",
        onMouseEnter: onEnter,
        onMouseLeave: onLeave,
        onFocus: onEnter,
        onBlur: onLeave,
      }
    : { className: "block" };

  return (
    // @ts-expect-error — Link and "div" accept different prop shapes; the two
    // branches above each build the correct one for their element.
    <Wrapper {...wrapperProps}>
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-raised ${frameClassName}`}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: hovered && !reduced ? 1.04 : 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={study.thumb}
            alt={`${study.client} — ${study.summary}`}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="object-cover"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
          />
        </motion.div>

        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null}

        {showIndex ? (
          <span className="mono absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 backdrop-blur-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      {/* `flex-wrap` is what keeps this off the page's scroll width at 320px.
          The meta is `shrink-0` — deliberately, so "Plant and machinery — 2025"
          never breaks mid-phrase next to a short client name — but that also
          means it cannot give way when the title beside it is already down to
          its longest word. On a 320px screen the two came to about 15px more
          than the column, and the whole page scrolled sideways to fit them.
          Wrapping drops the meta onto its own line in exactly that case and
          changes nothing at any width where both already fit. */}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {/* `accent`, not `blue`: the tile now also appears on the blue field,
            where a blue hover is the background. The token resolves to blue on
            ink and on paper exactly as before — this changes nothing on /work
            or in the industry grids. */}
        <h3 className="display text-step-2 transition-colors group-hover:text-accent">
          {study.client}
        </h3>
        <span className="mono shrink-0 text-content-dim">
          {study.sector} — {study.year}
        </span>
      </div>
      <p className="mt-2 max-w-[52ch] text-step--1 text-content-dim">
        {study.summary}
      </p>
    </Wrapper>
  );
}

export default WorkTile;
