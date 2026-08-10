import type { Metadata } from "next";
import { ARTICLES } from "@/lib/articles";
import { Eyebrow } from "@/components/ui/primitives";
import RevealHeading from "@/components/motion/RevealHeading";
import ArticleFeature from "@/components/articles/ArticleFeature";
import ArticleRow from "@/components/articles/ArticleRow";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Writing from the Puzzle studio on design process, motion, accessibility and building interfaces for AI.",
};

/**
 * The writing, as an editorial page rather than an index.
 *
 * It was a bordered table: date, title, standfirst, reading time, six times
 * over, with none of the generated artwork on it at all. The pictures existed
 * and only the homepage teaser was showing them.
 *
 * The shape now is a lead piece and then alternating rows. This page stays a
 * server component — the metadata, the data and the markup are all static, and
 * only the entrances need the client, which is where they live.
 *
 * Order is the array's, which is newest first, and it is not re-sorted here:
 * that makes the lead piece "the most recent" by construction rather than by a
 * flag someone has to remember to move.
 */
export default function ArticlesPage() {
  const [lead, ...rest] = ARTICLES;

  /* Which side each row leans to.
     Counted per shape, not per row. Alternating on the row index looked
     obviously right and was not: the three pieces with artwork happen to sit at
     even positions, so every one of them came out with its picture on the left
     and the "alternating" layout was a straight rail. Each shape now alternates
     within its own sequence, which is what produces the actual left/right
     rhythm down the page. */
  let media = 0;
  let text = 0;
  const rows = rest.map((article, i) => ({
    article,
    index: i + 2,
    flip: article.image ? media++ % 2 === 0 : text++ % 2 === 1,
  }));

  return (
    <section className="px-5 pb-32 pt-32 md:px-8 md:pb-40 md:pt-40">
      <div className="mx-auto w-full max-w-[120rem]">
        <header>
          <Eyebrow>Articles — {ARTICLES.length}</Eyebrow>
          <RevealHeading
            as="h1"
            className="display mt-4 max-w-[20ch] text-step-5"
            roman="Opinions we’re"
            italic="willing to defend"
          />
        </header>

        {lead ? <ArticleFeature article={lead} /> : null}

        {/* An ordered list, because the order is the point — these run newest
            first and the row numbers say so. `start` continues the count past
            the lead piece rather than restarting at one. */}
        <ol className="mt-24 md:mt-32" start={2}>
          {rows.map(({ article, index, flip }) => (
            <ArticleRow
              key={article.slug}
              article={article}
              index={index}
              flip={flip}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
