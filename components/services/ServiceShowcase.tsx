import ServiceChapter from "@/components/services/ServiceChapter";
import ShowcaseGrid from "@/components/services/ShowcaseGrid";
import type { Showcase } from "@/lib/services";

/**
 * The editorial block on a service page: a statement, the approach set beside
 * it, and the work underneath.
 *
 * Both halves are now components in their own right — `ServiceChapter` above
 * and `ShowcaseGrid` below — because the merged web page and the UX and UI page
 * each want several chapters, and /work wants the grid with no chapter at all.
 * Nothing here changed on the way out: this file composes exactly the markup it
 * used to contain, in the same order and with the same spacing, so the page
 * renders identically.
 *
 * It is no longer a client component either. Everything that needed the browser
 * moved into the grid with the panels, which is where it belonged.
 */
export function ServiceShowcase({ showcase }: { showcase: Showcase }) {
  return (
    /* Generous on both sides — this is the page's one editorial pause, and the
       air above and below it is what separates the argument from the service
       detail that follows. */
    <section className="mx-auto w-full max-w-[120rem] py-24 md:py-32">
      <ServiceChapter
        chapter={{
          eyebrow: "Our approach",
          statement: showcase.statement,
          body: showcase.body,
        }}
      />

      <ShowcaseGrid
        media={showcase.media}
        ratio={showcase.ratio}
        className="mt-16 md:mt-24"
      />
    </section>
  );
}

export default ServiceShowcase;
