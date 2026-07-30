import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "@/lib/articles";
import { Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Writing from the Puzzle studio on design process, motion, accessibility and building interfaces for AI.",
};

export default function ArticlesPage() {
  return (
    <section className="px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <Eyebrow>Articles — {ARTICLES.length}</Eyebrow>
      <h1 className="display mt-4 max-w-[20ch] text-step-5">
        Opinions we’re <em>willing to defend</em>
      </h1>

      <ul className="mt-16 border-t border-rule">
        {ARTICLES.map((a) => (
          <li key={a.slug} className="border-b border-rule">
            <Link
              href={`/articles/${a.slug}`}
              className="group grid gap-x-8 gap-y-3 py-8 md:grid-cols-[8rem_1fr_10rem]"
            >
              <time dateTime={a.datetime} className="mono text-content-dim">
                {a.date}
              </time>
              <div>
                <h2 className="display text-step-3 transition-colors group-hover:text-blue">
                  {a.title}
                </h2>
                <p className="mt-2 max-w-[60ch] text-step--1 text-content-dim">
                  {a.standfirst}
                </p>
              </div>
              <span className="mono text-content-dim md:text-right">
                {a.readingMinutes} min — {a.author}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
