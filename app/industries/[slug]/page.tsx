import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INDUSTRIES, getIndustry } from "@/lib/industries";
import { WORK } from "@/lib/work";
import { Eyebrow } from "@/components/ui/primitives";
import WorkTile from "@/components/work/WorkTile";

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
    <article className="px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <Eyebrow>Industries</Eyebrow>
      <h1 className="display mt-4 max-w-[16ch] text-step-5">{industry.name}</h1>
      <p className="mt-8 max-w-[56ch] text-step-1 text-content-dim">
        {industry.intro}
      </p>

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

      <section className="mt-20">
        <Eyebrow as="h2">
          {related.length ? `Work in ${industry.name}` : "Related work"}
        </Eyebrow>
        {related.length ? (
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((study, i) => (
              <WorkTile
                key={study.slug}
                study={study}
                index={i}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-rule p-10">
            <p className="text-step-0 text-content-dim">
              Nothing published in this sector yet — the relevant work is under
              NDA.
            </p>
            <Link
              href="/contact"
              className="mono mt-4 inline-flex text-blue underline underline-offset-4"
            >
              Ask us what we can show you
            </Link>
          </div>
        )}
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
    </article>
  );
}
