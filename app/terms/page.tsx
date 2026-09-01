import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/primitives";
import RevealHeading from "@/components/motion/RevealHeading";
import { SITE } from "@/lib/site";
import { TERMS, type TermsBlock } from "@/lib/terms";

export const metadata: Metadata = {
  /* The layout appends "— Puzzle", so this is the distinguishing half. */
  title: "Terms & Conditions",
  description:
    "The terms and conditions Puzzle Studios works under — order agreements, payment stages, cancellation, copyright, hosting and liability.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms & Conditions — Puzzle",
    description:
      "The terms and conditions Puzzle Studios works under — order agreements, payment stages, cancellation, copyright, hosting and liability.",
  },
};

/**
 * `{EMAIL}` becomes a `mailto:` link to the studio address.
 *
 * The address is never written into the copy: it comes from `SITE.email`, the
 * one place the site keeps it, so the terms cannot end up publishing an address
 * the rest of the site has moved on from.
 */
function withEmail(text: string): ReactNode {
  const parts = text.split("{EMAIL}");
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 ? (
        <a
          href={`mailto:${SITE.email}`}
          /* Same treatment as an inline link in an article body. `break-words`
             because the address is a single long token and this column is at
             its narrowest on a phone. */
          className="break-words underline decoration-[color:var(--link-underline)] decoration-1 underline-offset-4 transition-colors hover:text-accent"
        >
          {SITE.email}
        </a>
      ) : null}
    </span>
  ));
}

/**
 * One clause block.
 *
 * Deliberately the same vocabulary the rest of the site already uses, rather
 * than a legal-document stylesheet of its own: body copy is the article body's
 * paragraph, the aside is its takeaway treatment, and the list is the ruled
 * `▸` list from a service page.
 */
function Block({ block }: { block: TermsBlock }) {
  switch (block.kind) {
    case "note":
      return (
        <aside className="border-l-2 border-blue pl-5 md:pl-6">
          <p className="mono text-content-dim">Important</p>
          <p className="mt-3 text-step-0 leading-relaxed">
            {withEmail(block.text ?? "")}
          </p>
        </aside>
      );
    case "list":
      return (
        <ul className="border-t border-rule">
          {(block.items ?? []).map((item) => (
            <li
              key={item}
              className="flex items-start gap-4 border-b border-rule py-4"
            >
              <span className="mono mt-1 shrink-0 text-blue" aria-hidden="true">
                ▸
              </span>
              <span className="text-step-0 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p className="text-step-0 leading-relaxed">
          {withEmail(block.text ?? "")}
        </p>
      );
  }
}

/**
 * Terms & Conditions.
 *
 * Built on the article page's shape — the same `max-w-2xl` measure, the same
 * top padding that clears the fixed header — because this is long-form reading
 * and that is the reading column the site already has. Every clause is a
 * `<section>` with a linkable heading, so an individual term can be pointed at
 * directly; `scroll-mt-28` keeps a heading clear of the header when it is.
 */
export default function TermsPage() {
  return (
    <article className="px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Legal</Eyebrow>
        <RevealHeading
          as="h1"
          className="display mt-4 text-step-4"
          roman="Terms and"
          italic="conditions"
        />

        <div className="mt-12 grid gap-12 border-t border-rule pt-10">
          {TERMS.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2
                id={section.id}
                className="display scroll-mt-28 text-step-2"
              >
                {section.heading}
              </h2>
              <div className="mt-5 grid gap-5">
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
