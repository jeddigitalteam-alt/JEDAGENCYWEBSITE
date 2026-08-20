import Link from "next/link";
import RevealHeading from "@/components/motion/RevealHeading";

/**
 * A blue band across the page, used to break up a long editorial run.
 *
 * One component for all three places that use it — the retainer, the web page
 * and the product page — with the statement and the label passed in, so there
 * is a single CTA strip on this site rather than three that nearly match.
 *
 * `data-blue` is the site's third structural surface, the same one the footer
 * and the About page's closing block use. Everything inside resolves through
 * the token layer, which is also where the contrast decision already lives: ink
 * on blue at 7.4:1, never white on blue at 2.6:1.
 *
 * It breaks the page gutter with `-mx-5 md:-mx-8` so the colour runs edge to
 * edge. That is the same trick the homepage rail uses, and it is why this can
 * be dropped straight into the service template's padded `<article>` without a
 * wrapper: the strip cancels the padding it inherits, then reinstates it on the
 * inner row so the type still lines up with the text above and below it.
 *
 * The heading goes through `RevealHeading`, so it takes the site's masked
 * entrance like every other heading rather than arriving with one of its own.
 */
export function CtaStrip({
  statement,
  body,
  label,
  href = "/contact",
  secondary,
}: {
  statement: { roman: string; italic?: string };
  /** One plain sentence. Optional — the shorter strips do without it. */
  body?: string;
  /** The link text. Set in mono, so it reads as a control rather than prose. */
  label: string;
  href?: string;
  /** A second, quieter route. Outlined rather than filled. */
  secondary?: { label: string; href: string };
}) {
  return (
    <section
      data-blue
      /* Full bleed. `-mx-5 md:-mx-8` is the exact inverse of the gutter this
         sits inside — the service template's `<article className="px-5 md:px-8">`
         and the About page's own sections both use that scale — so the colour
         reaches the viewport edge on both sides with nothing left over. It is
         mirrored, not arbitrary: the alternative, `100vw` with a negative
         half-viewport margin, measures the scrollbar as page width and pushes
         a real horizontal overflow on Windows. */
      className="-mx-5 bg-surface text-content md:-mx-8"
      aria-label="Start a conversation"
    >
      {/* The background runs edge to edge; the content stays on the site's own
          grid — same max width and same gutter as every other section, so the
          type lines up with the chapters above and below it. */}
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8 px-5 py-16 md:px-8 md:py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-[46ch]">
          <RevealHeading
            as="h2"
            className="display max-w-[24ch] text-step-3"
            roman={statement.roman}
            italic={statement.italic}
          />
          {body ? (
            <p className="mt-5 text-step-0 text-content-dim">{body}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:shrink-0">
          <Link
            href={href}
            /* Ink pill on blue. The shared primary button is blue-on-ink, which
               would be blue on blue here, so this is the one place its colours
               are restated — exactly as the About page's closing block does. */
            className="mono group inline-flex items-center gap-2 rounded-full bg-content px-6 py-3 text-surface transition-opacity duration-200 hover:opacity-90"
          >
            {label}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>

          {secondary ? (
            <Link
              href={secondary.href}
              className="mono inline-flex items-center gap-2 rounded-full border border-content px-6 py-3 text-content transition-colors duration-200 hover:bg-content hover:text-surface"
            >
              {secondary.label}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default CtaStrip;
