import type { Metadata } from "next";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import AboutJourney, { type JourneyStage } from "@/components/about/AboutJourney";
import RevealHeading from "@/components/motion/RevealHeading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Puzzle is a design and digital studio for ambitious brands that want everything to feel more considered, connected and useful.",
};

/**
 * What we believe, as three statements rather than three paragraphs. Each is
 * short enough to be an assertion someone could disagree with, which is the
 * only kind worth printing at this size.
 */
const BELIEFS: { claim: { roman: string; italic: string }; body: string }[] = [
  {
    claim: { roman: "Clarity beats", italic: "decoration" },
    body: "If someone has to decode it first, the design has taken something from them rather than given them something. Most of the work is removal.",
  },
  {
    claim: { roman: "Useful beats", italic: "impressive" },
    body: "Impressive is judged in the room it is presented in. Useful is judged everywhere else, by people with no interest in how hard it was to make.",
  },
  {
    claim: { roman: "Good work should", italic: "survive the launch" },
    body: "Anyone can make the first version look right. The test is what it looks like after your team has used it for a year without us in the room.",
  },
];

/** How we work with clients. Four commitments, stated as things we do. */
const PRINCIPLES = [
  {
    n: "01",
    h: "Ask better questions",
    p: "The brief is where most projects are won or lost. We would rather spend the first week making it sharper than the last month building the wrong thing beautifully.",
  },
  {
    n: "02",
    h: "Challenge when it matters",
    p: "Not for sport, and not on taste. When the evidence points somewhere other than the plan, we say so early — while changing course is still cheap.",
  },
  {
    n: "03",
    h: "Build against reality",
    p: "Real content, real data volumes, real edge cases, and the real constraints of the team who will own it. A design that only holds when everything is tidy does not hold.",
  },
  {
    n: "04",
    h: "Stay close to the work",
    p: "Through launch and past it. The interesting problems tend to arrive once actual people are using the thing, which is exactly when most engagements end.",
  },
];

const JOURNEY: JourneyStage[] = [
  {
    label: "Where you are",
    body: "What you have built so far, what is genuinely working, and what is quietly costing you every month it stays as it is.",
  },
  {
    label: "What needs to change",
    body: "The smallest set of decisions that moves the most. Named plainly, put in order, and agreed before anything gets designed.",
  },
  {
    label: "What we build together",
    body: "Brand, site, product, motion and content made as one system rather than four projects that happen to share a logo.",
  },
  {
    label: "Where you go next",
    body: "A business that is clearer to understand, easier to trust, and equipped to keep moving without needing us in the room.",
  },
];

/**
 * About.
 *
 * Rebuilt around the client rather than the studio. The previous version led on
 * headcount — the heading was a number of people, and a draggable board of named
 * cards sat beneath it — which said something about us and nothing about what a
 * visitor gets. It also carried a founding year and a team roster that nothing
 * else on the site supports.
 *
 * What is kept is the one claim this studio can actually stand behind and that
 * the rest of the site already makes: the people who design the work are the
 * people who build it. Everything else here is positioning, not fact, and is
 * written so it cannot be read as a statistic.
 *
 * Structure follows the site's existing punctuation: dark section, inverted
 * section, dark section. Every major heading goes through `RevealHeading`, the
 * shared masked reveal, so nothing here competes with the site-wide motion
 * language.
 */
export default function AboutPage() {
  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="px-5 pt-32 md:px-8 md:pt-40">
        <Eyebrow>About</Eyebrow>
        <RevealHeading
          as="h1"
          className="display mt-4 max-w-[16ch] text-step-5"
          roman="Built for businesses"
          italic="going somewhere"
        />
        <div className="mt-8 grid max-w-[52ch] gap-5 text-step-1 text-content-dim">
          <p>
            Puzzle is a design and digital studio for ambitious brands that want
            everything to feel more considered, connected and useful.
          </p>
          <p>
            The people who design the work are the people who build it. That
            removes the most expensive translation step in the process, and it
            is why the thinking tends to survive contact with the code.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------- why we exist */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow>Why we exist</Eyebrow>
            <SectionHeading
              roman="The pieces should"
              italic="work together"
              className="mt-4 max-w-[14ch]"
            />
          </div>
          <div className="grid max-w-[56ch] gap-5 text-step-0 text-content-dim lg:col-span-7 lg:pt-2">
            <p>
              Most businesses we meet already know roughly where they want to
              go. What is missing is rarely ambition — it is the join. Brand
              sits with one team, the website with another, the product with a
              third, and content and motion arrive last with nobody quite owning
              how any of it fits together.
            </p>
            <p>
              None of those pieces is wrong on its own. Together they add up to
              something a customer has to work to understand, and most people
              will not do that work on your behalf.
            </p>
            <p className="text-content">
              Puzzle exists to make them behave as one thing. That is the whole
              idea, and it is where the name came from.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- what we believe */}
      <section
        data-invert
        className="bg-surface px-5 py-24 text-content md:px-8 md:py-32"
      >
        <Eyebrow>What we believe</Eyebrow>
        <ul className="mt-12 grid gap-14 md:mt-16 md:gap-20">
          {BELIEFS.map((belief) => (
            <li
              key={belief.claim.roman}
              className="grid gap-6 border-t border-rule pt-8 lg:grid-cols-12 lg:gap-16"
            >
              <RevealHeading
                as="h2"
                className="display max-w-[14ch] text-step-4 lg:col-span-7"
                roman={belief.claim.roman}
                italic={belief.claim.italic}
              />
              <p className="max-w-[46ch] text-step-0 text-content-dim lg:col-span-5 lg:pt-3">
                {belief.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------- how we show up */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <Eyebrow>How we work with you</Eyebrow>
        <SectionHeading
          roman="Alongside you,"
          italic="not at arm’s length"
          className="mt-4 max-w-[18ch]"
        />
        <p className="mt-8 max-w-[56ch] text-step-0 text-content-dim">
          We are not looking for briefs to receive and files to return. The work
          gets better when we are close enough to the business to argue about it
          properly.
        </p>

        <ul className="mt-16 grid gap-10 md:grid-cols-2 md:gap-x-16 md:gap-y-14">
          {PRINCIPLES.map((item) => (
            <li key={item.n} className="border-t border-rule pt-6">
              <p className="mono text-content-dim">{item.n}</p>
              {/* Through the shared reveal, like every other heading on the
                  page. These were the one set left static — the numbers and
                  copy around them are supporting text and stay put. */}
              <RevealHeading
                as="h3"
                className="display mt-4 text-step-2"
                roman={item.h}
              />
              <p className="mt-3 max-w-[46ch] text-step--1 text-content-dim">
                {item.p}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* -------------------------------------------------------- the journey */}
      <section
        data-invert
        className="bg-surface px-5 py-24 text-content md:px-8 md:py-32"
      >
        <Eyebrow>The journey</Eyebrow>
        <SectionHeading
          roman="Where you are, and"
          italic="where this goes"
          className="mt-4 max-w-[20ch]"
        />
        <p className="mt-8 max-w-[56ch] text-step-0 text-content-dim">
          We join for a stage of it. The point of that stage is that you come out
          of it moving faster, and able to keep going.
        </p>
        <AboutJourney stages={JOURNEY} />
      </section>

      {/* ---------------------------------------------------------- closing */}
      <section className="px-5 py-32 md:px-8 md:py-48">
        <Eyebrow>What we’re hungry for</Eyebrow>
        <SectionHeading
          roman="If you’re building the next"
          italic="version of your business"
          className="mt-4 max-w-[18ch]"
        />
        <div className="mt-8 grid max-w-[54ch] gap-5 text-step-1 text-content-dim">
          <p>
            Ambitious companies with something real to build. Problems where
            design genuinely changes whether people understand you, trust you or
            come back. Clients who want someone in the room rather than a
            supplier at the end of an email.
          </p>
          <p className="text-content">We would like to be part of it.</p>
        </div>
        <ButtonLink href="/contact" variant="primary" className="mt-10">
          Start a project
        </ButtonLink>
      </section>
    </>
  );
}
