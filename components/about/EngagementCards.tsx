import Link from "next/link";

/**
 * The three ways an engagement is actually shaped here, as one three-part block.
 *
 * These were three bordered cards floating on the page with gaps between them,
 * which read as a pricing table. They are now three full-height panels that
 * touch — light grey, Puzzle blue, near-black — so the section is one object
 * rather than three, and the sequence itself does the work of ranking them.
 *
 * Named after what they are rather than after a tier: there is no Bronze and no
 * Pro, because these are not products with prices. Nothing below states a fee,
 * a minimum term, a number of hours or a turnaround — none of that is settled
 * on this site, and inventing it would be the fastest way to make the page
 * untrue.
 *
 * "Sprint" was considered and dropped. What the site actually publishes is a
 * phased project or a standing arrangement; a fixed-length sprint is a third
 * commercial model this studio has not said it offers. "Focused engagement"
 * describes the real middle case without inventing a product.
 *
 * Only the retainer links out, because it is the only one of the three with a
 * page of its own. The other two route to the scope builder, which is where a
 * project actually gets shaped.
 */

/**
 * Each panel names its own colours rather than reading the token layer.
 *
 * This is the one section on the site that deliberately sets three different
 * surfaces side by side, so the tokens cannot describe it — `--surface` is a
 * single value per section by definition. The pairings are the site's own
 * (`--paper-dim` on ink, `--blue` with ink on it, `--ink` with paper on it) and
 * the contrast rule is the same one the rest of the site follows: **ink on
 * blue, never white on blue** — 7.4:1 against 2.6:1.
 */
const PANELS = [
  {
    n: "01",
    name: "Project",
    lede: "A defined brief with an outcome we can name before it starts.",
    bestFor: [
      "Brand identities",
      "Websites, designed and built",
      "Product launches",
      "Focused UX and UI work",
    ],
    href: "/services#scope",
    cta: "Build a scope",
    tag: null,
    surface: "var(--paper-dim)",
    ink: "var(--ink)",
    dim: "color-mix(in oklab, var(--ink) 62%, var(--paper-dim))",
    rule: "color-mix(in oklab, var(--ink) 14%, transparent)",
  },
  {
    n: "02",
    name: "Focused engagement",
    lede: "A concentrated period around one specific problem or priority.",
    bestFor: [
      "Prototypes worth testing",
      "A journey that keeps losing people",
      "Landing pages and campaigns",
      "A design system that needs attention",
    ],
    href: "/services#scope",
    cta: "Build a scope",
    tag: null,
    surface: "var(--blue)",
    ink: "var(--ink)",
    /* 76% ink on blue is where secondary type clears 4.5:1 — the same mix the
       blue field uses for `--content-dim`. */
    dim: "color-mix(in oklab, var(--ink) 76%, var(--blue))",
    rule: "color-mix(in oklab, var(--ink) 22%, transparent)",
  },
  {
    n: "03",
    name: "Retainer",
    lede: "For teams that need Puzzle regularly rather than once.",
    bestFor: [
      "Ongoing design capacity",
      "Products that keep evolving",
      "Continuous website improvement",
      "Embedded creative support",
    ],
    href: "/services/retainer",
    cta: "How a retainer works",
    /* Descriptive, not a sales badge — it says what the arrangement is, which
       "Most popular" would not, since nothing here measures that. */
    tag: "Ongoing",
    surface: "var(--ink)",
    ink: "var(--paper)",
    dim: "color-mix(in oklab, var(--paper) 62%, var(--ink))",
    rule: "color-mix(in oklab, var(--paper) 18%, transparent)",
  },
];

export function EngagementCards() {
  return (
    /* Breaks the page gutter so the three fields meet the viewport edges, the
       way the CTA strip does. `grid` with no gap is what makes them touch;
       `items-stretch` is implicit, so all three are the height of the tallest. */
    <ul className="-mx-5 mt-14 grid md:mt-20 md:-mx-8 lg:grid-cols-3">
      {PANELS.map((p) => (
        <li key={p.name} style={{ backgroundColor: p.surface, color: p.ink }}>
          <Link
            href={p.href}
            className="group flex h-full flex-col px-6 py-14 md:px-10 md:py-20 lg:px-12"
          >
            <span className="mono flex items-center justify-between gap-4">
              <span style={{ color: p.dim }}>{p.n}</span>
              {p.tag ? (
                <span
                  className="rounded-full border px-3 py-1"
                  style={{ borderColor: p.rule, color: p.dim }}
                >
                  {p.tag}
                </span>
              ) : null}
            </span>

            <h3 className="display mt-8 max-w-[14ch] text-step-3">{p.name}</h3>
            <p className="mt-4 max-w-[34ch] text-step-0" style={{ color: p.dim }}>
              {p.lede}
            </p>

            <p className="mono mt-10" style={{ color: p.dim }}>
              Best for
            </p>
            <ul
              className="mt-4 grid gap-3 border-t pt-4"
              style={{ borderColor: p.rule }}
            >
              {p.bestFor.map((b) => (
                <li key={b} className="flex items-start gap-3 text-step--1">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: p.dim }}
                  />
                  <span style={{ color: p.dim }}>{b}</span>
                </li>
              ))}
            </ul>

            {/* `mt-auto` pins this to the bottom whatever the list length, so
                three panels of different heights still line their CTAs up. */}
            <span className="mono mt-auto inline-flex items-center gap-2 pt-12">
              {p.cta}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default EngagementCards;
