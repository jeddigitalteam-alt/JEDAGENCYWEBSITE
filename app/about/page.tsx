import type { Metadata } from "next";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";
import RevealHeading from "@/components/motion/RevealHeading";
import ResultsStats from "@/components/about/ResultsStats";
import ServiceStickers from "@/components/about/ServiceStickers";
import EngagementCards from "@/components/about/EngagementCards";
import AboutCta from "@/components/about/AboutCta";
import FAQ, { FaqJsonLd } from "@/components/ui/FAQ";
import WhatsAppCta from "@/components/ui/WhatsAppCta";
import { ABOUT_FAQS } from "@/lib/faqs";

export const metadata: Metadata = {
  /* The layout appends "— Puzzle", so this is the distinguishing half. Longer
     than the old bare "About" because this is the page people reach from a
     search for the studio rather than for a service. */
  title: "About — UK creative and digital agency",
  description:
    "Puzzle is an independent UK creative and digital agency in Hampshire, working across brand identity, web design and development, UX and UI, digital product design and AI design. Newly founded, and building a reputation on work that performs.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Puzzle — UK creative and digital agency",
    description:
      "An independent UK creative and digital agency working across brand, web, UX and product design. Newly founded, and building a reputation on work that performs.",
  },
};

/**
 * Three claims, each short enough to be something a reader could disagree with.
 * Kept from the previous version of this page — they were the strongest writing
 * on it, and they say more in three lines than the four paragraphs they used to
 * sit under.
 */
const BELIEFS: { claim: { roman: string; italic: string }; body: string }[] = [
  {
    claim: { roman: "Clarity beats", italic: "decoration" },
    body: "If someone has to decode it first, the design has taken something from them rather than given them something.",
  },
  {
    claim: { roman: "Useful beats", italic: "impressive" },
    body: "Impressive is judged in the room it is presented in. Useful is judged everywhere else.",
  },
  {
    claim: { roman: "Good work should", italic: "survive the launch" },
    body: "The test is what it looks like after your team has used it for a year without us in the room.",
  },
];

/**
 * About.
 *
 * Rebuilt to argue visually rather than at length. The previous version was six
 * sections of prose — roughly nine hundred words of body copy with no images,
 * no components and nothing to look at between the headings. Everything it
 * genuinely said is still here; most of it is now carried by a component
 * instead of a paragraph.
 *
 * What was cut, and where it went:
 *
 *   - "Why we exist", three paragraphs on disciplines not joining up, is now
 *     one statement and the sticker row underneath it, which shows the same
 *     point instead of describing it.
 *   - "What we believe" kept its three claims and lost a third of their words.
 *   - "How we show up", four numbered principles at ~45 words each, became the
 *     three engagement cards — the same argument, framed as a choice the reader
 *     can actually make.
 *   - "The journey", a four-stage draggable board, is gone. It restated the
 *     process every service page already publishes phase by phase, and
 *     `AboutJourney` is no longer imported by anything.
 *   - The closing section became the blue CTA.
 *
 * Two things are new rather than reduced: the results graphic, and the FAQ —
 * which is where the page's indexable long-form copy now lives, answering
 * questions people actually search rather than padding a paragraph.
 *
 * The founding position is stated plainly and never dressed up. Nothing on this
 * page claims a year, a client count, an award or a performance figure, because
 * nothing in this repository supports one.
 */
export default function AboutPage() {
  return (
    <>
      <FaqJsonLd faqs={ABOUT_FAQS} />

      {/* ---------------------------------------------------------- hero */}
      <section className="px-5 pt-32 md:px-8 md:pt-40">
        <Eyebrow>About Puzzle</Eyebrow>
        <RevealHeading
          as="h1"
          className="display mt-4 max-w-[15ch] text-step-5"
          roman="We're new."
          italic="Our standards aren't"
        />
        <p className="mt-8 max-w-[58ch] text-step-1 text-content-dim">
          Puzzle is an independent UK creative and digital agency in Hampshire,
          working across brand identity, web design and development, UX and UI,
          digital product design and AI design — around one measure: whether the
          work does the job it was made for.
        </p>
      </section>

      {/* ------------------------------------------ newly founded, stated */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Eyebrow>Where we are</Eyebrow>
            <SectionHeading
              roman="Building a reputation,"
              italic="one result at a time"
              className="mt-4 max-w-[16ch]"
            />
          </div>
          <div className="grid max-w-[52ch] gap-5 text-step-0 text-content-dim lg:col-span-5 lg:col-start-8 lg:pt-3">
            <p>
              We are a young studio, and we would rather say so than imply
              otherwise. There is real work behind us — it is on this site — but
              we are still building the body of work that will define Puzzle.
              No decades-old reputation to coast on, and no version of this
              where your project is another job passed to whoever is free.
            </p>
            <p>
              What that buys you is attention — fewer layers, less agency
              theatre, and the people who design the work being the people who
              build it. Every project still has something to prove, and every
              result adds to the name we are making. That is exactly the
              pressure we want to be under.
            </p>
          </div>
        </div>
      </section>

      {/* One low-friction option after the two opening text sections, and well
          clear of the blue CTA at the foot of the page.

          The padded wrapper is load-bearing: the strip is full-bleed by default and
          works by cancelling
          the gutter it inherits, so with no parent padding to cancel it pushes
          20px (32 from md) past each edge of the document instead. Same wrapper
          the CTA strips use for the same reason. */}
      <div className="px-5 md:px-8">
        <WhatsAppCta />
      </div>

      {/* ------------------------------------------------- results graphic */}
      <section data-invert className="bg-surface text-content">
        <ResultsStats />
      </section>

      {/* -------------------------------------------------- what we do */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <Eyebrow as="h2">What we do</Eyebrow>
        <SectionHeading
          roman="Six disciplines,"
          italic="usually two or three at once"
          className="mt-4 max-w-[20ch]"
        />
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          Most projects need more than one of these, which is the argument for
          keeping them under one roof rather than briefing them separately.
        </p>
        <ServiceStickers />
      </section>

      {/* ------------------------------------------- how we work together */}
      <section
        data-invert
        className="bg-surface px-5 py-24 text-content md:px-8 md:py-32"
      >
        <Eyebrow as="h2">How we can work together</Eyebrow>
        <SectionHeading
          roman="Three shapes."
          italic="Pick the one that fits"
          className="mt-4 max-w-[18ch]"
        />
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          The difference is how much is known at the start — and whether the
          work stops when it ships.
        </p>
        <EngagementCards />
      </section>

      {/* --------------------------------------------------- why puzzle */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <Eyebrow as="h2">Why Puzzle</Eyebrow>
        <ul className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-3 lg:gap-10">
          {BELIEFS.map((belief) => (
            <li key={belief.claim.roman} className="border-t border-rule pt-8">
              <RevealHeading
                as="h3"
                className="display max-w-[14ch] text-step-3"
                roman={belief.claim.roman}
                italic={belief.claim.italic}
              />
              <p className="mt-5 max-w-[38ch] text-step-0 text-content-dim">
                {belief.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------------- faq */}
      <section
        data-invert
        className="bg-surface px-5 py-24 text-content md:px-8 md:py-32"
      >
        {/* Heading and centring both come from the component now, so this and
            every service page share one treatment. */}
        <FAQ faqs={ABOUT_FAQS} eyebrow="About Puzzle" />
      </section>

      {/* --------------------------------------------------------- cta */}
      <AboutCta />
    </>
  );
}
