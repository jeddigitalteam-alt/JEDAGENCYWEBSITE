import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import ArticleFigure from "@/components/articles/ArticleFigure";
import type { Article, ArticleBlock } from "@/lib/articles";

/**
 * Inline links, written in the body as `[label](/services)`.
 *
 * A deliberately tiny parser rather than a markdown dependency: the only inline
 * mark these pieces use is a link, and the whole grammar is one regex. Anything
 * that is not a link is text, so a stray bracket renders as a stray bracket
 * instead of disappearing.
 *
 * External hrefs are left to a plain anchor with the usual rel; everything
 * beginning with `/` goes through `next/link`, so internal links keep
 * prefetching and the site's route transition.
 */
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

function inline(text: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  LINK.lastIndex = 0;

  while ((match = LINK.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const [, label, href] = match;
    const className =
      "underline decoration-[color:var(--link-underline)] decoration-1 underline-offset-4 transition-colors hover:text-accent";
    out.push(
      href.startsWith("/") ? (
        <Link key={out.length} href={href} className={className}>
          {label}
        </Link>
      ) : (
        <a
          key={out.length}
          href={href}
          rel="noreferrer noopener"
          target="_blank"
          className={className}
        >
          {label}
        </a>
      ),
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length === 1 ? out[0] : out;
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.kind) {
    case "h2":
      /* `.display` at step-2, which sits clearly above the body without
         competing with the h1. The scroll margin keeps a heading clear of the
         fixed header when a fragment link lands on it. */
      return (
        <h2 className="display mt-10 scroll-mt-28 text-step-2 first:mt-0">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="display mt-8 scroll-mt-28 text-step-1 first:mt-0">
          {block.text}
        </h3>
      );
    case "takeaway":
      /* The one piece of chrome in the body: a blue rule and a label. Enough to
         mark a summary as a summary, and not so much that it becomes a card. */
      return (
        <aside className="my-4 border-l-2 border-blue pl-5 md:pl-6">
          <p className="mono text-content-dim">Takeaway</p>
          <p className="mt-3 text-step-0 leading-relaxed">
            {inline(block.text)}
          </p>
        </aside>
      );
    default:
      return (
        <p className="text-step-0 leading-relaxed">{inline(block.text)}</p>
      );
  }
}

/**
 * An article body: blocks in order, with the figure set at its break.
 *
 * `bodyImageAfter` is a block index and defaults to the midpoint, so a picture
 * stays roughly central as a piece grows rather than drifting up it. It is
 * stated in the data wherever the natural break is not the arithmetic middle,
 * and clamped here so an index left behind by an edit cannot fall off the end.
 */
export function ArticleBody({ article }: { article: Article }) {
  const last = article.body.length - 1;
  const at = Math.min(
    article.bodyImageAfter ?? Math.floor(last / 2),
    last,
  );

  return (
    <div className="mt-10 grid gap-6">
      {article.body.map((block, i) => (
        <Fragment key={i}>
          <Block block={block} />
          {article.bodyImage && i === at ? (
            <ArticleFigure
              image={article.bodyImage}
              className="my-6 md:my-10"
            />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

export default ArticleBody;
