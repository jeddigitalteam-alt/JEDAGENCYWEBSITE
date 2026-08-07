import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INDUSTRIES, getIndustry } from "@/lib/industries";
import { WORK } from "@/lib/work";
import { Eyebrow } from "@/components/ui/primitives";
import RevealHeading from "@/components/motion/RevealHeading";

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return { title: "Industry" };
  return {
    title: industry.name,
    description: industry.summary,
    openGraph: {
      title: `${industry.name} — Puzzle`,
      description: industry.summary,
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const related = WORK.filter((w) => w.industries.includes(slug));

  return (
    <article className="pb-24">
      {industry.image ? (
        /*
          Full-bleed hero, built as two layers of the same picture.

          **Why two.** The plates are 1254x1254. A single `cover` layer scales
          to the frame's *width*, so on a full-bleed hero it was enlarging them
          1.15x at 1440, 1.53x at 1920 and 2.74x at 3440 — which is what made
          the artwork look soft — while cropping away about half its height. The
          source simply is not big enough to fill a wide hero that way, and no
          `sizes` change can help: Next never serves more pixels than the file
          has, so the browser was stretching a 1254px image either way.

          `contain` scales to whichever axis runs out first, and on a landscape
          hero that is the *height*. The same plates then render at 0.63x at
          1440x900 and 1.01x at 2560 — downscaled or native, never blown up —
          and none of the artwork is cropped at all.

          What `contain` cannot do is fill the width, so the second layer does:
          the same file, `cover`, blurred hard and dimmed. It is scenery for the
          edges, and because it is blurred beyond recognition its own resolution
          is irrelevant — it is deliberately fetched small.

          The sharp plate sits right from `lg` and the type sits left of it, so
          the two never overlap and the type is always on the quiet blurred
          field rather than on the artwork. Below `lg` the plate goes to the top
          and the type sits underneath it.

          `isolate` opens a stacking context so both layers can sit at `-z-10`
          behind the type without reaching the fixed site header. `svh` rather
          than `vh` because on a phone `vh` is the *largest* viewport, so a
          `100vh` hero is taller than the screen until the address bar retracts.
        */
        <section className="relative isolate flex min-h-[86svh] items-end overflow-hidden px-5 pb-16 pt-40 md:px-8 md:pb-20 md:pt-48 lg:min-h-[88svh] lg:items-center">
          {/* Blurred fill. `scale-125` pushes the blur's soft edge off the
              frame — a blurred image drawn to its own bounds fades to
              transparent at the sides and leaves a visible vignette. Fetched at
              a fraction of the width on purpose: it is about to be destroyed by
              a 64px blur, so a large source would be bytes spent on nothing. */}
          <Image
            src={industry.image}
            alt=""
            aria-hidden="true"
            fill
            sizes="640px"
            className="absolute inset-0 -z-20 scale-125 object-cover opacity-60 blur-3xl"
            style={{ objectPosition: industry.imagePosition ?? "center 50%" }}
          />

          {/* The artwork itself, whole and unscaled. */}
          <Image
            src={industry.image}
            alt={industry.imageAlt ?? ""}
            fill
            priority
            /* The plate is bounded by the hero's height, not the viewport's
               width, and it is square — so its drawn width is roughly the hero
               height. `88vh` is that, expressed in the only units `sizes`
               understands. Capped at the source's own 1254px, since asking for
               more cannot produce more. */
            sizes="(min-width: 1024px) min(88vh, 1254px), 100vw"
            className="absolute inset-0 -z-10 object-contain object-top lg:object-right"
          />

          {/* One scrim, and a light one. With the type on the blurred field
              rather than on the artwork it has much less to do than it did over
              a full-bleed crop — this is a floor for the bottom-left corner on
              small screens, where the plate sits above the type, plus a short
              wash under the fixed header. Neither touches the plate itself. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(to top," +
                "color-mix(in oklab, var(--ink) 78%, transparent) 0%," +
                "color-mix(in oklab, var(--ink) 40%, transparent) 22%," +
                "transparent 52%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-40"
            style={{
              background:
                "linear-gradient(to bottom," +
                "color-mix(in oklab, var(--ink) 72%, transparent) 0%," +
                "transparent 100%)",
            }}
          />

          <div className="relative lg:max-w-[46%]">
            <Eyebrow>Industries</Eyebrow>
            <RevealHeading
              as="h1"
              className="display mt-4 max-w-[16ch] text-step-5"
              roman={industry.name}
            />
            <p className="mt-6 max-w-[52ch] text-step-1 text-content">
              {industry.intro}
            </p>
          </div>
        </section>
      ) : (
        /* Sectors with no artwork keep the plain hero they have always had. */
        <section className="px-5 pt-32 md:px-8 md:pt-40">
          <Eyebrow>Industries</Eyebrow>
          <RevealHeading
            as="h1"
            className="display mt-4 max-w-[16ch] text-step-5"
            roman={industry.name}
          />
          <p className="mt-8 max-w-[56ch] text-step-1 text-content-dim">
            {industry.intro}
          </p>
        </section>
      )}

      <div className="px-5 md:px-8">
      <section className="mt-16">
        <Eyebrow as="h2">What we’ve learned</Eyebrow>
        <ul className="mt-6 max-w-3xl border-t border-rule">
          {industry.notes.map((note, i) => (
            <li key={note} className="flex gap-6 border-b border-rule py-5">
              <span className="mono shrink-0 text-blue">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-step-0">{note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Both optional — sectors that carry no capabilities/audience data render
          exactly as they did before. */}
      {industry.capabilities ? (
        <section className="mt-20">
          <Eyebrow as="h2">What we do here</Eyebrow>
          <ul className="mt-6 max-w-3xl border-t border-rule">
            {industry.capabilities.map((c) => (
              <li
                key={c}
                className="flex items-start gap-4 border-b border-rule py-4"
              >
                <span className="mono mt-1 shrink-0 text-blue" aria-hidden="true">
                  ▸
                </span>
                <span className="text-step-0">{c}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {industry.audience ? (
        <section className="mt-20">
          <Eyebrow as="h2">Who we work with</Eyebrow>
          <ul className="mt-6 flex max-w-4xl flex-wrap gap-3">
            {industry.audience.map((a) => (
              <li
                key={a}
                className="mono rounded-full border border-rule px-5 py-2.5 text-content-dim"
              >
                {a}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* This was a grid of project tiles — screenshots of the clients' live
          sites, shown inside what is otherwise a generic sector page. The
          pictures are gone; the route through to the work is not. /work and
          /industries both still carry the full set with their imagery, and the
          case studies are untouched. */}
      <section className="mt-20">
        <Eyebrow as="h2">Work in {industry.name}</Eyebrow>
        <div className="mt-8 rounded-xl border border-dashed border-rule p-8 md:p-10">
          {related.length ? (
            <>
              <p className="max-w-[56ch] text-step-0 text-content-dim">
                {related.length === 1
                  ? "One published project in this sector."
                  : `${related.length} published projects in this sector.`}{" "}
                Written-up case studies and the rest of the work live together
                on one page.
              </p>
              <Link
                href="/work"
                className="mono mt-6 inline-flex rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
              >
                See the work
              </Link>
            </>
          ) : (
            <>
              <p className="max-w-[56ch] text-step-0 text-content-dim">
                Nothing published in this sector yet — the relevant work is
                under NDA.
              </p>
              <Link
                href="/contact"
                className="mono mt-4 inline-flex text-blue underline underline-offset-4"
              >
                Ask us what we can show you
              </Link>
            </>
          )}
        </div>
      </section>

      <nav className="mt-24 flex flex-wrap gap-3 border-t border-rule pt-8">
        {INDUSTRIES.filter((i) => i.slug !== slug).map((i) => (
          <Link
            key={i.slug}
            href={`/industries/${i.slug}`}
            className="mono rounded-full border border-rule px-5 py-2.5 text-content-dim transition-colors hover:border-blue hover:text-blue"
          >
            {i.name}
          </Link>
        ))}
      </nav>
      </div>
    </article>
  );
}
