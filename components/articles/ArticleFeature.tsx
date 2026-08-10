"use client";

import { motion } from "motion/react";
import Link from "next/link";
import ArticleMedia from "@/components/articles/ArticleMedia";
import { useArticleEntrance } from "@/components/articles/use-article-entrance";
import { Eyebrow } from "@/components/ui/primitives";
import type { Article } from "@/lib/articles";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The lead piece: the newest article, given the top of the page.
 *
 * Asymmetric on purpose — picture on seven columns, words on five, held to the
 * middle of the picture's height. A full-width image with the headline beneath
 * is the shape the work tile already owns, and repeating it here would make the
 * two pages read as the same page.
 *
 * The whole thing is one link. Nothing inside it is separately clickable, so
 * there is no nested interactive content and a keyboard reaches the piece in
 * one tab stop.
 */
export function ArticleFeature({ article }: { article: Article }) {
  const { ref, lit, reduced } = useArticleEntrance<HTMLDivElement>();

  return (
    <div ref={ref} className="mt-16 md:mt-24">
      <Link
        href={`/articles/${article.slug}`}
        className="group grid items-center gap-8 lg:grid-cols-12 lg:gap-14"
      >
        <motion.div
          className="lg:col-span-7"
          initial={false}
          animate={lit ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.8, ease: EASE }}
        >
          <ArticleMedia
            article={article}
            lit={lit}
            reduced={reduced}
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </motion.div>

        <motion.div
          className="lg:col-span-5"
          initial={false}
          animate={lit ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          /* Behind the picture, so the two read as one arrival rather than two
             competing ones. */
          transition={{
            duration: reduced ? 0 : 0.8,
            delay: reduced ? 0 : 0.12,
            ease: EASE,
          }}
        >
          <Eyebrow>Latest</Eyebrow>

          <h2 className="display mt-5 text-step-4">
            {/* The underline is a scaled line, not a border or a background
                size: it is the one property here that costs nothing to
                animate. */}
            <span className="relative inline">
              {article.title}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 motion-reduce:transition-none"
              />
            </span>
          </h2>

          <p className="mt-6 max-w-[46ch] text-step-0 text-content-dim">
            {article.standfirst}
          </p>

          <div className="mono mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-content-dim">
            <time dateTime={article.datetime}>{article.date}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingMinutes} min</span>
            <span aria-hidden="true">·</span>
            <span>{article.author}</span>
          </div>

          <span className="mono mt-8 inline-flex items-center gap-3 text-content">
            Read the piece
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            >
              →
            </span>
          </span>
        </motion.div>
      </Link>
    </div>
  );
}

export default ArticleFeature;
