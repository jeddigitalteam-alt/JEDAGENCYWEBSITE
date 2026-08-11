import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, getService } from "@/lib/services";
import { Eyebrow } from "@/components/ui/primitives";
import RevealHeading from "@/components/motion/RevealHeading";
import ServiceShowcase from "@/components/services/ServiceShowcase";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service" };
  return {
    title: service.name,
    description: service.summary,
    openGraph: { title: `${service.name} — Puzzle`, description: service.summary },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const total = service.phases.reduce((n, p) => n + p.weeks, 0);

  /**
   * The small blue markers — the deliverable arrows and the phase numerals.
   *
   * Blue on ink is 7.4:1 and is the site's own accent for exactly this. Blue on
   * paper is 2.6:1, which is why the token layer refuses it for text at all, so
   * on paper these take the muted ink the About journey's numerals already use.
   * Not `--accent`: that stays blue on both surfaces on purpose, for large type
   * and borders rather than eleven-pixel labels.
   */
  const marker = service.paper ? "text-content-dim" : "text-blue";

  return (
    <article
      /* One attribute is the whole light theme. `[data-invert]` reassigns the
         semantic tokens — surface, content, content-dim, rule, link — and every
         utility on this page already reads from them, so nothing below is
         restyled per surface except the two places that name a raw colour.
         Server-rendered, so there is no dark first paint to flash out of. */
      {...(service.paper ? { "data-invert": true } : {})}
      className={`px-5 pb-24 pt-32 md:px-8 md:pt-40 ${
        service.paper ? "bg-surface text-content" : ""
      }`}
    >
      <Eyebrow>Services</Eyebrow>
      <RevealHeading
        as="h1"
        className="display mt-4 max-w-[18ch] text-step-5"
        roman={service.headline.roman}
        italic={service.headline.italic}
      />
      {/* A service with a showcase opens on the headline alone. The statement
          and the paragraphs beside it make this argument at length a screen
          later, and printing the one-line version here as well would be the
          same point twice before the reader has scrolled. */}
      {service.showcase ? (
        <ServiceShowcase showcase={service.showcase} />
      ) : (
        <p className="mt-8 max-w-[56ch] text-step-1 text-content-dim">
          {service.intro}
        </p>
      )}

      <div
        className={`grid gap-12 lg:grid-cols-2 lg:gap-16 ${
          /* The showcase brings its own closing space; without it the hero
             paragraph needs the gap. */
          service.showcase ? "mt-4" : "mt-20"
        }`}
      >
        <section>
          <Eyebrow as="h2">What you get</Eyebrow>
          <ul className="mt-6 border-t border-rule">
            {service.deliverables.map((d) => (
              <li
                key={d}
                className="flex items-start gap-4 border-b border-rule py-4"
              >
                <span
                  className={`mono mt-1 shrink-0 ${marker}`}
                  aria-hidden="true"
                >
                  ▸
                </span>
                <span className="text-step-0">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <Eyebrow as="h2">How it runs — {total} weeks</Eyebrow>
          <ol className="mt-6 grid gap-3">
            {service.phases.map((p, i) => (
              <li
                key={p.name}
                /* `bg-surface-raised`, not `bg-ink-raised`. The semantic token
                   resolves to exactly the same ink-raised on every dark service
                   page — these tiles are pixel-identical there — and to a
                   near-paper on this one, instead of four dark cards left
                   stranded on a white page. */
                className="flex items-center justify-between rounded-lg border border-rule bg-surface-raised px-5 py-4"
              >
                <span className="flex items-center gap-4">
                  <span className={`mono ${marker}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-step-0">{p.name}</span>
                </span>
                <span className="mono tabular-nums text-content-dim">
                  {p.weeks}w
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-xl border border-rule p-6">
            <p className="text-step--1 text-content-dim">
              Timelines assume one round of consolidated feedback per phase. If
              you need this faster, say so early — it usually means changing the
              scope rather than the schedule.
            </p>
            <Link
              href="/services#scope"
              className="mono mt-5 inline-flex rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
            >
              Build a full scope
            </Link>
          </div>
        </section>
      </div>

      <nav className="mt-24 flex flex-wrap gap-3 border-t border-rule pt-8">
        {SERVICES.filter((s) => s.slug !== service.slug).map((s) => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className="mono rounded-full border border-rule px-5 py-2.5 text-content-dim transition-colors hover:border-blue hover:text-blue"
          >
            {s.name}
          </Link>
        ))}
      </nav>
    </article>
  );
}
