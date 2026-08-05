import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/lib/articles";
import { Eyebrow } from "@/components/ui/primitives";
import ReadingProgress from "@/components/articles/ReadingProgress";
import RevealHeading from "@/components/motion/RevealHeading";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article" };
  return {
    title: article.title,
    description: article.standfirst,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.standfirst,
      publishedTime: article.datetime,
      authors: [article.author],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const others = ARTICLES.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <>
      <ReadingProgress />
      <article className="px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <div className="mx-auto max-w-2xl">
          <Eyebrow>
            {article.readingMinutes} min read — {article.author}
          </Eyebrow>
          <RevealHeading
            as="h1"
            className="display mt-4 text-step-4"
            roman={article.title}
          />
          <p className="mt-6 text-step-1 text-content-dim">
            {article.standfirst}
          </p>
          <time
            dateTime={article.datetime}
            className="mono mt-8 block border-t border-rule pt-6 text-content-dim"
          >
            {article.date}
          </time>

          <div className="mt-10 grid gap-6">
            {article.body.map((p, i) => (
              <p key={i} className="text-step-0 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>

        <aside className="mx-auto mt-24 max-w-2xl border-t border-rule pt-8">
          <Eyebrow as="h2">Keep reading</Eyebrow>
          <ul className="mt-6 grid gap-4">
            {others.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/articles/${a.slug}`}
                  className="group flex items-baseline justify-between gap-6"
                >
                  <span className="display text-step-1 transition-colors group-hover:text-blue">
                    {a.title}
                  </span>
                  <span className="mono shrink-0 text-content-dim">
                    {a.readingMinutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </article>
    </>
  );
}
