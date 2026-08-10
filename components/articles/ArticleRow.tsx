"use client";

import { motion } from "motion/react";
import Link from "next/link";
import ArticleMedia from "@/components/articles/ArticleMedia";
import { useArticleEntrance } from "@/components/articles/use-article-entrance";
import type { Article } from "@/lib/articles";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One article, as an editorial row.
 *
 * Two shapes, from one piece of data — whether the article has artwork:
 *
 *  - **with a picture**, the row is two columns and the picture alternates
 *    side down the page, so the eye is pulled left and right rather than down a
 *    single rail;
 *  - **without one**, the row is type alone at a generous measure, offset to
 *    the side the picture would have taken.
 *
 * Two of the six pieces have no generated artwork. Inventing a stand-in for
 * them, or borrowing a neighbour's, would both be worse than letting the layout
 * change: a text row at this size reads as a deliberate variation in the
 * rhythm, and it is the truthful one. If artwork is generated later, dropping
 * the path into `lib/articles.ts` moves the row into the other shape with no
 * change here.
 */
export function ArticleRow({
  article,
  index,
  flip,
}: {
  article: Article;
  /** Position in the list, printed as the row's number. */
  index: number;
  /** Put the picture on the left. Alternated by the caller. */
  flip: boolean;
}) {
  const { ref, lit, reduced } = useArticleEntrance<HTMLLIElement>();
  const hasMedia = Boolean(article.image);

  const meta = (
    <div className="mono mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-content-dim">
      <time dateTime={article.datetime}>{article.date}</time>
      <span aria-hidden="true">·</span>
      <span>{article.readingMinutes} min</span>
      <span aria-hidden="true">·</span>
      <span>{article.author}</span>
    </div>
  );

  return (
    <li ref={ref} className="border-t border-rule">
      <Link
        href={`/articles/${article.slug}`}
        className="group grid items-center gap-8 py-12 md:py-16 lg:grid-cols-12 lg:gap-14"
      >
        {hasMedia ? (
          <motion.div
            className={`lg:col-span-5 ${flip ? "lg:order-1" : "lg:order-2"}`}
            initial={false}
            animate={lit ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.8, ease: EASE }}
          >
            <ArticleMedia
              article={article}
              lit={lit}
              reduced={reduced}
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </motion.div>
        ) : null}

        <motion.div
          className={
            hasMedia
              ? `lg:col-span-6 ${flip ? "lg:order-2 lg:col-start-7" : "lg:order-1"}`
              : // No picture: the words take the measure the picture would have
                // shared, offset to the side it would have been on.
                `lg:col-span-8 ${flip ? "lg:col-start-5" : "lg:col-start-1"}`
          }
          initial={false}
          animate={lit ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          transition={{
            duration: reduced ? 0 : 0.8,
            delay: reduced ? 0 : 0.1,
            ease: EASE,
          }}
        >
          <span className="mono text-content-dim">
            {String(index).padStart(2, "0")}
          </span>

          <h2
            className={`display mt-4 transition-colors group-hover:text-accent ${
              hasMedia ? "text-step-3" : "text-step-4"
            }`}
          >
            <span className="relative inline">
              {article.title}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 motion-reduce:transition-none"
              />
            </span>
          </h2>

          <p
            className={`mt-5 text-step-0 text-content-dim ${
              hasMedia ? "max-w-[46ch]" : "max-w-[60ch]"
            }`}
          >
            {article.standfirst}
          </p>

          {meta}
        </motion.div>
      </Link>
    </li>
  );
}

export default ArticleRow;
