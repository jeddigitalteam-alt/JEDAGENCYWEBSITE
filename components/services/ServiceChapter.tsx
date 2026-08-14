import { Eyebrow, SectionHeading } from "@/components/ui/primitives";
import type { Chapter } from "@/lib/services";

/**
 * A statement, and the argument set in a column beside it.
 *
 * This was the top half of `ServiceShowcase` and is now shared, because the
 * service pages that carry an editorial run want the same block two or three
 * times rather than once. The markup is unchanged, so the page it came from
 * renders exactly as it did.
 *
 * Text on both sides is the point of the layout: a statement with nothing next
 * to it is a poster, and paragraphs with nothing above them are a page of copy.
 * 6 / gutter / 5 rather than a plain half-and-half — the offset keeps the
 * reading column off the statement's longest line and gives the pair an axis
 * instead of a fold down the middle. Below `lg` the two stack, because display
 * type at this size in a half-width tablet column breaks to one word a line.
 *
 * The heading goes through `SectionHeading`, so it takes the site's line-by-line
 * masked reveal without asking for it. The paragraphs do not animate: body copy
 * that stages itself in is body copy you have to wait for.
 */
export function ServiceChapter({
  chapter,
  className = "",
}: {
  chapter: Chapter;
  className?: string;
}) {
  return (
    <section className={className}>
      {chapter.eyebrow ? <Eyebrow>{chapter.eyebrow}</Eyebrow> : null}

      <div
        className={`grid gap-10 lg:grid-cols-12 lg:gap-16 ${
          chapter.eyebrow ? "mt-10 lg:mt-14" : ""
        }`}
      >
        <SectionHeading
          roman={chapter.statement.roman}
          italic={chapter.statement.italic}
          className="max-w-[18ch] lg:col-span-6"
        />
        <div className="grid max-w-[52ch] gap-5 text-step-0 text-content-dim lg:col-span-5 lg:col-start-8 lg:pt-3">
          {chapter.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceChapter;
