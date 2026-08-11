"use client";

import { motion } from "motion/react";
import Image from "next/image";
import type { Article } from "@/lib/articles";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * An article's artwork, in a frame cut to the source's own ratio.
 *
 * Every generated poster is 1536x1024 — 3:2 — and each carries its own
 * lettering, so the frame is 3:2 and `object-cover` has nothing to crop. Set a
 * different ratio here and the type inside the artwork loses its edges.
 *
 * Two movements, and both are transforms: the picture rises a little out of its
 * own frame as the row arrives, and it takes a slow scale on hover. The frame
 * clips, so neither ever touches layout.
 */
export function ArticleMedia({
  article,
  lit,
  reduced,
  sizes,
  priority = false,
  className = "",
}: {
  article: Article;
  lit: boolean;
  reduced: boolean;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!article.image) return null;

  return (
    <div
      className={`relative aspect-[3/2] overflow-hidden rounded-xl bg-surface-raised ${className}`}
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={lit ? { y: "0%", scale: 1 } : { y: "6%", scale: 1.06 }}
        transition={{ duration: reduced ? 0 : 1.1, ease: EASE }}
      >
        {/* The hover scale is a class rather than a second Motion value: two
            animators on one transform property fight each other.

            `motion-safe:` on the scale, not `motion-reduce:transform-none`
            alongside it. Tailwind v4 compiles `scale-*` to the standalone
            `scale` property, which `transform: none` does not touch — so that
            guard reads like it disables the hover and measurably does not.
            Gating the rule on the query instead means it does not exist for a
            reader who asked for no movement. */}
        <Image
          src={article.image.src}
          alt={article.image.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </motion.div>
    </div>
  );
}

export default ArticleMedia;
