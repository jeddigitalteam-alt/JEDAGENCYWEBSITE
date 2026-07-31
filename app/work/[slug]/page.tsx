import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WORK, getCase } from "@/lib/work";
import { Eyebrow } from "@/components/ui/primitives";
import {
  ChapterNav,
  DeviceShowcase,
  PaletteReveal,
} from "@/components/work/LevantParts";

export function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCase(slug);
  if (!study) return { title: "Case study" };
  return {
    title: `${study.client} — ${study.sector}`,
    description: study.summary,
    openGraph: {
      title: `${study.client} — Puzzle`,
      description: study.summary,
      images: [{ url: study.hero }],
    },
  };
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mono text-content-dim">{label}</dt>
      <dd className="mono mt-1">{value}</dd>
    </div>
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCase(slug);
  if (!study) notFound();

  const isLevant = study.full === true;

  return (
    <article className="pb-24 pt-24 md:pt-28">
      {/* hero */}
      {study.heroAspect ? (
        /* Whole-artwork hero. The frame takes the image's own ratio, so the
           composition arrives complete — nothing cropped, no bars inside the
           frame — and is capped against viewport height so a near-square
           source cannot push the headline off the screen. */
        <div className="px-5 md:px-8">
          <div
            className="relative mx-auto w-full overflow-hidden"
            style={{
              aspectRatio: study.heroAspect,
              maxWidth: "min(100%, 78vh)",
            }}
          >
            <Image
              src={study.hero}
              alt={`${study.client} — ${study.summary}`}
              fill
              priority
              sizes="(min-width: 768px) 78vh, 100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={study.hero}
            alt={`${study.client} — ${study.summary}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={
              study.heroPosition
                ? { objectPosition: study.heroPosition }
                : undefined
            }
          />
        </div>
      )}

      <header className="px-5 pt-12 md:px-8 md:pt-16">
        <Eyebrow>
          {study.client} — {study.year}
        </Eyebrow>
        <h1 className="display mt-4 max-w-[16ch] text-step-5">
          {study.headline ? (
            <>
              {study.headline.roman} <em>{study.headline.italic}</em>
            </>
          ) : (
            study.client
          )}
        </h1>

        <dl className="mt-12 grid gap-6 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Client" value={study.client} />
          <Meta label="Sector" value={study.sector.toUpperCase()} />
          <Meta label="Scope" value={study.scope.join(", ")} />
          <Meta label="Year" value={study.year} />
        </dl>
      </header>

      {isLevant ? (
        <div className="mt-20 grid gap-12 px-5 md:px-8 lg:grid-cols-[14rem_1fr] lg:gap-16">
          {study.chapters ? <ChapterNav chapters={study.chapters} /> : null}

          <div className="max-w-3xl">
            <section id="brief" className="scroll-mt-28">
              <Eyebrow as="h2">01 — The brief</Eyebrow>
              <p className="display mt-4 text-step-3">
                A tennis brand with <em>no history</em> to trade on
              </p>
              <div className="mt-6 grid gap-5 text-step-0 text-content-dim">
                <p>
                  LEVANT came to us with a factory, a fabric contract and a
                  twelve-week window before their first drop. No name equity, no
                  athlete roster, no archive. The category they were entering is
                  dominated by brands that have been on court for sixty years.
                </p>
                <p>
                  Competing on heritage was not available. Competing on
                  specificity was. The brief we agreed on was narrow: make the
                  product legible enough that a serious club player can tell,
                  from a photograph, exactly what the garment does.
                </p>
              </div>
            </section>

            <section id="identity" className="mt-20 scroll-mt-28">
              <Eyebrow as="h2">02 — Identity</Eyebrow>
              <p className="display mt-4 text-step-3">
                Type that behaves like <em>kit labelling</em>
              </p>
              <div className="mt-6 grid gap-5 text-step-0 text-content-dim">
                <p>
                  The identity is built on a contrast: a high-contrast serif for
                  statements, and a tight monospace for everything factual —
                  colourway, cut, weight, view. The monospace does the work. It
                  appears on the garment tags, the size guide, the product page
                  and the campaign, always saying something verifiable.
                </p>
                <p>
                  That gave the brand a voice without needing a manifesto.
                  <span className="text-content">
                    {" "}
                    COLORWAY: 03. DARK GREY
                  </span>{" "}
                  reads as confidence because it is simply true.
                </p>
              </div>
            </section>

            <section id="palette" className="mt-20 scroll-mt-28">
              <Eyebrow as="h2">03 — Palette</Eyebrow>
              <p className="display mt-4 text-step-3">
                Colour taken from the <em>surface</em>
              </p>
              <p className="mt-6 text-step-0 text-content-dim">
                The palette is pulled from clay-court photography rather than
                invented. Clay carries the campaign, near-black carries the kit,
                and a single warm accent marks the one action that matters on
                any given page.
              </p>
              {study.palette ? <PaletteReveal swatches={study.palette} /> : null}
            </section>

            <section id="product" className="mt-20 scroll-mt-28">
              <Eyebrow as="h2">04 — Product pages</Eyebrow>
              <p className="display mt-4 text-step-3">
                Every question answered <em>above the fold</em>
              </p>
              <div className="mt-6 grid gap-5 text-step-0 text-content-dim">
                <p>
                  The product page is the whole business. Ours leads with the
                  garment at full bleed, then answers fit, fabric weight, and
                  what the piece is actually for — in that order, in the
                  monospace, before any marketing copy.
                </p>
                <p>
                  The size guide is a first-class surface rather than a modal
                  afterthought, because returns are the margin.
                </p>
              </div>

              {study.screens ? (
                <DeviceShowcase
                  screens={study.screens}
                  caption="Screens from the build — drag, or use the arrows"
                />
              ) : null}
            </section>

            <section id="outcome" className="mt-20 scroll-mt-28">
              <Eyebrow as="h2">05 — Outcome</Eyebrow>
              <p className="display mt-4 text-step-3">
                Sold through in <em>nine days</em>
              </p>
              <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
                {study.metrics?.map((m) => (
                  <div key={m.label} className="bg-surface p-5">
                    <dd className="display text-step-3">{m.value}</dd>
                    <dt className="mono mt-2 text-content-dim">{m.label}</dt>
                  </div>
                ))}
              </dl>
              <p className="mt-8 text-step-0 text-content-dim">
                The inaugural drop cleared in nine days. More usefully, the
                return rate came in at 4.1% against a category average closer to
                twelve — which we attribute to the size guide and the fit copy
                more than anything visual.
              </p>
            </section>
          </div>
        </div>
      ) : (
        <div className="mt-16 px-5 md:px-8">
          <div className="max-w-3xl">
            <p className="text-step-1 text-content-dim">{study.summary}</p>
            <div className="mt-10 rounded-xl border border-rule bg-ink-raised p-6">
              <p className="mono text-content-dim">Case study in progress</p>
              <p className="mt-3 max-w-[52ch] text-step--1 text-content-dim">
                We haven’t written this one up yet.{" "}
                <Link
                  href="/work/levant"
                  className="text-blue underline underline-offset-4"
                >
                  Read the LEVANT case study
                </Link>{" "}
                for a full account of how we work, or{" "}
                <Link
                  href="/contact"
                  className="text-blue underline underline-offset-4"
                >
                  ask us about this project directly
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="mt-24 border-t border-rule px-5 pt-8 md:px-8">
        <Link
          href="/work"
          className="mono transition-colors hover:text-blue"
          style={{ color: "var(--link)" }}
        >
          ← All work
        </Link>
      </nav>
    </article>
  );
}
