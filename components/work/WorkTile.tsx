"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { CaseStudy } from "@/lib/work";

/**
 * Work tile. Plays a silent looping video on hover where one exists, and
 * otherwise animates the still — the cursor becomes a "VIEW" disc either way
 * via `data-cursor`.
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
}: {
  study: CaseStudy;
  index: number;
  priority?: boolean;
  sizes?: string;
  videoSrc?: string;
  /**
   * Extra classes for the image frame. Used by the full-width featured tile to
   * widen its aspect ratio on large screens — at a fixed 4:3 a full-bleed tile
   * is taller than the viewport on any wide monitor. Defaults to nothing, so
   * every other tile keeps the plain 4:3 box.
   */
  frameClassName?: string;
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

  return (
    <Link
      href={`/work/${study.slug}`}
      data-cursor="View"
      className="group block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
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

        <span className="mono absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="display text-step-2 transition-colors group-hover:text-blue">
          {study.client}
        </h3>
        <span className="mono shrink-0 text-content-dim">
          {study.sector} — {study.year}
        </span>
      </div>
      <p className="mt-2 max-w-[52ch] text-step--1 text-content-dim">
        {study.summary}
      </p>
    </Link>
  );
}

export default WorkTile;
