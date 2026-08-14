import type { Metadata } from "next";
import Link from "next/link";
import WorkRail from "@/components/work/WorkRail";
import ProcessTimeline from "@/components/process/ProcessTimeline";
import ShowcaseGrid, {
  type ShowcaseMedia,
} from "@/components/services/ShowcaseGrid";
import { Eyebrow, Interlock, SectionHeading } from "@/components/ui/primitives";
import { WORK } from "@/lib/work";
import RevealHeading from "@/components/motion/RevealHeading";

/**
 * Four panels, read left to right then top to bottom.
 *
 * Served from `public/work/gallery/`, not from the folder these arrived in: a
 * literal `&` in a directory name survives `next dev` and fails outright in a
 * production build — 404 on the raw file, 400 from the image optimiser. See
 * NOTES.md. All four are 2000×2000, so the square panels crop nothing.
 */
const GALLERY: ShowcaseMedia[] = [
  {
    kind: "image",
    src: "/work/gallery/bespoke-garden-decor-journal.png",
    alt: "Bespoke Garden Decor — a journal piece on choosing timber, open on the site's blog",
    width: 2000,
    height: 2000,
  },
  {
    kind: "image",
    src: "/work/gallery/levant-campaign.png",
    alt: "LEVANT — the campaign homepage, its headline set over a clay-court film",
    width: 2000,
    height: 2000,
  },
  {
    kind: "image",
    src: "/work/gallery/bespoke-garden-decor-products.png",
    alt: "Bespoke Garden Decor — the handcrafted product range, shown over the kind of garden it is built for",
    width: 2000,
    height: 2000,
  },
  {
    kind: "image",
    src: "/work/gallery/south-downs-home.png",
    alt: "South Downs Plant & Machinery — the homepage and its stock search, over a yard of used excavators",
    width: 2000,
    height: 2000,
  },
];

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects from Puzzle — brand identity, websites and digital products — and the five-stage process behind them.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <section className="pb-24 pt-32 md:pt-40">
        <div className="px-5 md:px-8">
          <Eyebrow>{WORK.length} projects</Eyebrow>
          <RevealHeading
            as="h1"
            className="display mt-4 max-w-[18ch] text-step-5"
            roman="Completed"
            italic="Projects"
          />
          <p className="mono mt-6 max-w-[52ch] text-content-dim">
            Drag, scroll or use the arrow keys.
          </p>
        </div>

        <div className="mt-16">
          <WorkRail />
        </div>
      </section>

      {/*
        The same treatment the web design and development page uses, and the
        same component: four square panels, two across, separated by nothing but
        the page.

        Which is why the section is inverted. On ink the gaps between the panels
        would be gaps in the dark and the four would read as one block; the
        gutters are only gutters when the surface behind them is paper. That is
        one attribute — `[data-invert]` reassigns the semantic token layer and
        everything inside follows it, exactly as the homepage's paper sections
        do. Nothing here is restyled for the surface.
      */}
      <section
        data-invert
        className="bg-surface px-5 py-24 text-content md:px-8 md:py-32"
      >
        {/* The measure the homepage's paper section already uses, so the
            heading's left edge and the grid's line up and the pair stops
            growing on a genuinely wide display rather than becoming a mural. */}
        <div className="mx-auto w-full max-w-[120rem]">
          <Eyebrow>In detail</Eyebrow>
          <SectionHeading
            roman="The work,"
            italic="close up"
            className="mt-4 max-w-[18ch]"
          />
          <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
            Four screens from the past year — a journal, a campaign, a product
            range and a machine search.
          </p>

          <ShowcaseGrid media={GALLERY} className="mt-16 md:mt-24" />
        </div>
      </section>

      {/* The join between the work and the process behind it. The interlock is
          the site's own divider — the notch motif used structurally — so this
          reads as a change of subject rather than a new page. */}
      <div className="px-5 md:px-8">
        <Interlock />
      </div>

      {/*
        Everything below was the /how-we-work page. It is unchanged apart from
        its opening, which was a page hero and is now a section heading: the h1
        became an h2 at the section size, because a second h1 under "Completed
        Projects" would be two page titles, and its top padding gave way to the
        divider above. The timeline and the closing CTA are untouched.

        `scroll-mt-28` clears the fixed header when /work#how-we-work is opened
        directly or arrived at from the old route.
      */}
      <section id="how-we-work" className="scroll-mt-28 px-5 pt-20 md:px-8">
        <Eyebrow>Process</Eyebrow>
        <RevealHeading
          as="h2"
          className="display mt-4 max-w-[20ch] text-step-4"
          roman="Five stages, and we"
          italic="mean all five"
        />
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          Most studios describe a process they abandon by week three. This is
          the one we actually run, including the parts that are unglamorous.
        </p>
      </section>

      <ProcessTimeline />

      <section className="px-5 py-24 md:px-8">
        <div className="rounded-2xl border border-rule bg-ink-raised p-8 md:p-12">
          <h2 className="display max-w-[20ch] text-step-3">
            Want this applied to <em>something specific</em>?
          </h2>
          <p className="mt-4 max-w-[52ch] text-step--1 text-content-dim">
            Build a scope on the services page and send it over, or just tell us
            what you’re trying to do.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="mono rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
            >
              Build a scope
            </Link>
            <Link
              href="/contact"
              className="mono rounded-full bg-blue px-5 py-2.5 text-ink transition-colors hover:bg-blue-lift active:scale-[0.98]"
            >
              Start a project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
