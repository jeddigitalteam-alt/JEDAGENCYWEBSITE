import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";
import RevealHeading from "@/components/motion/RevealHeading";
import CtaStrip from "@/components/ui/CtaStrip";
import WhatsAppCta from "@/components/ui/WhatsAppCta";
import ShowcaseGrid from "@/components/services/ShowcaseGrid";
import { MARKET_MARKS } from "@/components/markets/MarketMarks";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Markets — who we design for",
  description:
    "Puzzle designs for B2B, B2C, ecommerce and D2C, hospitality and experiences, and startups and scale-ups. Different audiences, different commercial pressure, same need to be clear and credible.",
  alternates: { canonical: "/markets" },
  openGraph: {
    title: "Markets — who Puzzle designs for",
    description:
      "B2B, B2C, ecommerce, hospitality and startups. The audience changes and the pressure changes; the job of the design does not.",
  },
};

/**
 * One market.
 *
 * `image` is always work that already exists on this site and genuinely belongs
 * to the market it illustrates — the South Downs machinery catalogue for B2B,
 * LEVANT for D2C, and so on. Two markets have no matching client work yet and
 * carry no picture rather than borrowing an unrelated one; their sections are
 * built to hold a mark and a list instead, which is why the layouts alternate.
 */
interface Market {
  n: string;
  slug: keyof typeof MARKET_MARKS;
  name: string;
  full: string;
  /** The heading. Roman + italic, the site's signature. */
  statement: { roman: string; italic: string };
  body: string[];
  /** What the market actually contains. Short, concrete, not exhaustive. */
  examples: string[];
  /** The design problem, as a list of the things that decide it. */
  pressures: string[];
  /** Slugs from `SERVICES` — rendered as links, never as claims. */
  services: string[];
  image?: { src: string; alt: string; width: number; height: number };
}

const MARKETS: Market[] = [
  {
    n: "01",
    slug: "b2b",
    name: "B2B",
    full: "Business to business",
    statement: { roman: "They have decided", italic: "before they contact you" },
    body: [
      "A business buyer does most of the work before you know they exist. They read, compare, forward a link to a colleague and build a shortlist — all of it without speaking to anyone. By the time an enquiry arrives, the decision is largely made.",
      "So the site has to do the convincing on its own. That means saying what you actually do in the first screen, making a complicated offer legible without flattening it, and giving somebody enough evidence to put your name in front of their own boss.",
    ],
    examples: [
      "Manufacturers",
      "Industrial suppliers",
      "Logistics",
      "Consultants",
      "Professional services",
      "SaaS",
    ],
    pressures: [
      "Credibility established in seconds",
      "Complex offers made legible",
      "Specification and detail people can trust",
      "A next step that is easy to take",
    ],
    services: ["web-design-development", "digital-product-design", "ux-ui-design"],
    image: {
      src: "/work/ux-ui-design/machine-search.png",
      alt: "South Downs Plant & Machinery — the machine search, filters open beside the results",
      width: 2000,
      height: 2000,
    },
  },
  {
    n: "02",
    slug: "b2c",
    name: "B2C",
    full: "Business to consumer",
    statement: { roman: "One visit,", italic: "usually on a phone" },
    body: [
      "Consumer businesses are judged fast and often once. Somebody finds you on a map or a search result, looks for a few minutes on a phone, and decides whether you seem like the sort of business that will turn up and do a good job.",
      "Almost all of that is a trust problem rather than an information problem. Real photographs beat stock ones. A clear price beats an invitation to enquire for one. And the enquiry itself has to be two taps away from wherever somebody happens to be standing.",
    ],
    examples: ["Clinics", "Gyms and studios", "Salons", "Trades", "Education", "Leisure"],
    pressures: [
      "A first impression that survives a small screen",
      "Trust built from real evidence",
      "Local and organic discovery",
      "An enquiry route with no friction",
    ],
    services: ["web-design-development", "brand-identity", "ux-ui-design"],
    image: {
      src: "/work/digital-product-design/garden-decor-phone.png",
      alt: "Bespoke Garden Decor — the homepage on a phone, its quote and services actions over a finished pergola",
      width: 2000,
      height: 2000,
    },
  },
  {
    n: "03",
    slug: "ecommerce",
    name: "Ecommerce & D2C",
    full: "Direct to consumer",
    statement: { roman: "Here the design", italic: "is the shop floor" },
    body: [
      "When the site is the sales channel, every design decision has a number attached to it. A product page that answers the wrong question, a filter that hides half the range, a checkout that asks for an account too early — each of those is measurable, and each is a design problem before it is a marketing one.",
      "The other half is difference. Most storefronts are built from the same handful of themes, which makes the ones that feel like a brand rather than a template disproportionately memorable. That is where the identity work and the commerce work stop being separate jobs.",
    ],
    examples: ["Fashion", "Sportswear", "Cosmetics", "Homeware", "Food and drink", "Subscription"],
    pressures: [
      "Product presentation that sells the thing",
      "Discovery that reaches the whole range",
      "Checkout friction removed, not decorated",
      "Campaign creative that matches the store",
    ],
    services: ["web-design-development", "brand-identity", "ux-ui-design"],
    image: {
      src: "/work/web-design/levant-tee.png",
      alt: "LEVANT — the 001 tee product page open on a phone against an orange set",
      width: 2000,
      height: 2000,
    },
  },
  {
    n: "04",
    slug: "hospitality",
    name: "Hospitality & experiences",
    full: "Places people book",
    statement: { roman: "Sell the evening,", italic: "then make it easy to book" },
    body: [
      "Nobody books a table because the availability grid was well built. They book because something on the page made them want to be there — and then the booking did not get in the way.",
      "So these sites are two jobs sitting on top of each other. The first is atmosphere: photography, pace, restraint, a sense of the place. The second is logistics: where it is, when it opens, what it costs, and a booking flow that works with one thumb on a train.",
    ],
    examples: ["Hotels", "Restaurants", "Venues", "Tourism", "Events", "Leisure"],
    pressures: [
      "Atmosphere carried by the imagery",
      "Practical information that is never buried",
      "A booking journey that holds on mobile",
      "Credibility for somewhere people have not been",
    ],
    services: ["brand-identity", "web-design-development", "ux-ui-design"],
  },
  {
    n: "05",
    slug: "startups",
    name: "Startups & scale-ups",
    full: "Building the thing and the credibility at once",
    statement: { roman: "Explaining something", italic: "that does not exist yet" },
    body: [
      "New companies have a harder version of every problem on this page. There is no category to sit inside, no reputation doing the work in the background, and often no obvious comparison to explain the thing against. The design is carrying the credibility on its own.",
      "What that needs is a system rather than a set of screens: an identity that will still hold in a year, a product that can grow without being redrawn, and components that survive the pace of a team shipping weekly. It is the work we are closest to, for reasons that are probably obvious.",
    ],
    examples: ["Tech startups", "Apps", "SaaS", "New consumer brands", "Funded ventures"],
    pressures: [
      "Credibility before there is a track record",
      "A new idea explained in one screen",
      "MVP that can become a mature product",
      "Design that keeps up with weekly releases",
    ],
    services: ["digital-product-design", "brand-identity", "ai-design", "retainer"],
  },
];

/** Only render a service link that actually exists. */
function serviceLinks(slugs: string[]) {
  return slugs
    .map((slug) => SERVICES.find((s) => s.slug === slug))
    .filter((s): s is (typeof SERVICES)[number] => Boolean(s));
}

/**
 * Markets.
 *
 * This replaced an index plus nine sector pages. Nine thin pages said roughly
 * the same thing nine times and split the search value between them; one page
 * that makes an argument is both better to read and easier to rank. The old
 * URLs all 308 here — see `next.config.ts`.
 *
 * The rhythm is deliberately uneven. Sections alternate ink, paper and blue,
 * and the five markets do not share a layout: two carry a full picture beside
 * the copy, two are built around their mark and their lists, and the middle one
 * takes a split field. A five-card grid would have been faster to write and
 * would have read as a directory.
 *
 * Everything here is the existing system — `SectionHeading`, `Eyebrow`,
 * `RevealHeading`, `ShowcaseGrid`, `CtaStrip`, `WhatsAppCta` and the token
 * layer. Nothing new was invented to build it except the five marks.
 */
export default function MarketsPage() {
  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="px-5 pt-32 md:px-8 md:pt-40">
        <Eyebrow>Markets</Eyebrow>
        <RevealHeading
          as="h1"
          className="display mt-4 max-w-[16ch] text-step-5"
          roman="Different businesses. Different pressures."
          italic="Same need to be convincing"
        />
        <p className="mt-8 max-w-[58ch] text-step-1 text-content-dim">
          We work with companies selling to other businesses, to consumers, and
          to everyone in between. The audience changes and the commercial
          pressure changes. The job of the design does not: make the right thing
          clear, credible and easy to act on.
        </p>

        {/* The five marks as a row, doubling as the page's contents. */}
        <ul className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-24 md:grid-cols-3 lg:grid-cols-5">
          {MARKETS.map((m) => {
            const Mark = MARKET_MARKS[m.slug];
            return (
              <li key={m.slug}>
                <a href={`#${m.slug}`} className="group block rounded-xl">
                  <Mark className="w-16 transition-transform duration-500 ease-out group-hover:-translate-y-1.5 motion-reduce:transform-none md:w-20" />
                  <p className="mono mt-5 text-content-dim">{m.n}</p>
                  <p className="display mt-1 text-step-1 transition-colors group-hover:text-blue">
                    {m.name}
                  </p>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------- the five */}
      {MARKETS.map((m, i) => {
        const Mark = MARKET_MARKS[m.slug];
        const links = serviceLinks(m.services);
        /* Paper on the even ones, ink on the odd — so the page alternates all
           the way down rather than running as one field. */
        const paper = i % 2 === 1;
        return (
          <section
            key={m.slug}
            id={m.slug}
            {...(paper ? { "data-invert": true } : {})}
            className={`scroll-mt-24 px-5 py-24 md:px-8 md:py-32 ${
              paper ? "bg-surface text-content" : ""
            }`}
          >
            <div className="mx-auto w-full max-w-[120rem]">
              <div className="flex items-start gap-6">
                <Mark className="w-14 shrink-0 md:w-16" />
                <div>
                  <p className="mono text-content-dim">
                    {m.n} — {m.full}
                  </p>
                  <SectionHeading
                    roman={m.statement.roman}
                    italic={m.statement.italic}
                    className="mt-3 max-w-[18ch]"
                  />
                </div>
              </div>

              <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-16">
                {/* `content-start`: without it the rows stretch to the height
                    of the taller column beside them and the two paragraphs end
                    up a screen apart. */}
                <div className="grid max-w-[54ch] content-start gap-5 text-step-0 text-content-dim lg:col-span-6">
                  {m.body.map((para) => (
                    <p key={para.slice(0, 28)}>{para}</p>
                  ))}

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {m.examples.map((e) => (
                      <li
                        key={e}
                        className="mono rounded-full border border-rule px-4 py-2 text-step--1"
                      >
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-5 lg:col-start-8">
                  {m.image ? (
                    <Image
                      src={m.image.src}
                      alt={m.image.alt}
                      width={m.image.width}
                      height={m.image.height}
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="w-full rounded-xl object-cover"
                    />
                  ) : null}

                  <p className="mono mt-8 text-content-dim">What decides it</p>
                  <ul className="mt-4 grid gap-3 border-t border-rule pt-4">
                    {m.pressures.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-step--1">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                        />
                        <span className="text-content-dim">{p}</span>
                      </li>
                    ))}
                  </ul>

                  {links.length ? (
                    <p className="mt-8 flex flex-wrap gap-2">
                      {links.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className="mono rounded-full border border-rule px-4 py-2 text-step--1 text-content-dim transition-colors hover:border-blue hover:text-blue"
                        >
                          {s.name}
                        </Link>
                      ))}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* --------------------------------------------------- mid-page CTA */}
      <div className="px-5 md:px-8">
        <CtaStrip
          statement={{ roman: "Not sure where", italic: "you fit?" }}
          body="That is fine. Tell us what you sell, who you sell it to, and what needs to change."
          label="Talk it through"
          secondary={{ label: "Build a scope", href: "/services#scope" }}
        />
      </div>

      {/* ------------------------------------------------- work, as proof */}
      <section
        data-invert
        className="bg-surface px-5 py-24 text-content md:px-8 md:py-32"
      >
        <div className="mx-auto w-full max-w-[120rem]">
          <Eyebrow as="h2">Across all of them</Eyebrow>
          <SectionHeading
            roman="The market changes the problem."
            italic="The pieces stay the same"
            className="mt-4 max-w-[20ch]"
          />
          <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
            A machinery dealer and a clothing label want opposite things from a
            homepage, and both of them need structure, a system and someone to
            build it properly.
          </p>
          <ShowcaseGrid
            className="mt-16 md:mt-24"
            media={[
              {
                kind: "image",
                src: "/work/gallery/south-downs-home.png",
                alt: "South Downs Plant & Machinery — the homepage, its machine search over a working yard",
                width: 2000,
                height: 2000,
              },
              {
                kind: "image",
                src: "/work/gallery/levant-campaign.png",
                alt: "LEVANT — the campaign site, its headline set over footage from the court",
                width: 2000,
                height: 2000,
              },
              {
                kind: "image",
                src: "/work/gallery/bespoke-garden-decor-journal.png",
                alt: "Bespoke Garden Decor — the journal index, its articles set as illustrated cards",
                width: 2000,
                height: 2000,
              },
              {
                kind: "image",
                src: "/work/ux-ui-design/enquiry-sheet.png",
                alt: "South Downs Plant & Machinery — the export enquiry sheet, its steps in black and yellow",
                width: 1872,
                height: 1872,
              },
            ]}
          />
        </div>
      </section>

      {/* ------------------------------------------- services, cross-linked */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[120rem]">
          <Eyebrow as="h2">The pieces</Eyebrow>
          <SectionHeading
            roman="Different market. Different pressure."
            italic="Right pieces"
            className="mt-4 max-w-[20ch]"
          />
          <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule md:mt-20 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.slug} className="bg-surface">
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex h-full flex-col p-8 transition-colors hover:bg-surface-raised md:p-10"
                >
                  <span className="display text-step-2 transition-colors group-hover:text-blue">
                    {s.name}
                  </span>
                  <span className="mt-3 max-w-[34ch] text-step--1 text-content-dim">
                    {s.summary}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mono mt-auto pt-8 text-blue transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------- whatsapp */}
      {/* The padded wrapper is what the strip breaks out of — see the
          component. Full width like every other WhatsApp CTA on the site. */}
      <div className="px-5 md:px-8">
        <WhatsAppCta />
      </div>

      {/* ------------------------------------------------------ closing CTA */}
      <div className="px-5 md:px-8">
        <CtaStrip
          statement={{ roman: "Want to book an", italic: "intro meeting with us?" }}
          body="Tell us what you sell and who you sell it to, and we will tell you what the work looks like."
          label="Book an intro"
          secondary={{ label: "Build a scope", href: "/services#scope" }}
        />
      </div>
    </>
  );
}
