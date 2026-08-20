"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";
import type { Faq } from "@/lib/faqs";

/** The site's expo-out, as Motion's tuple form of --ease-lock. */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The site's one FAQ treatment. Used by the About page and every service page,
 * so there is a single accordion implementation rather than seven.
 *
 * Editorial rather than carded: full-width rows separated by the same hairline
 * `border-rule` the rest of the site uses, question set at section-heading
 * scale, and the only chrome is one blue circular control on the right. A box
 * around every question would turn a page of prose into a page of widgets.
 *
 * Each row is a real `<button>` inside a heading, so the section keeps a
 * sensible outline: the `<h2>` is the section title and every question is an
 * `<h3>`. `aria-expanded` and `aria-controls` describe the state, the panel is
 * removed from the tree when closed rather than merely hidden, and the button
 * takes the site's global blue focus ring — no custom focus handling.
 *
 * Open state is a single index, not a set: one answer at a time keeps the page
 * from growing under the reader while they are still reading. Clicking the open
 * row closes it.
 */
export function FAQ({
  faqs,
  eyebrow = "Questions",
  heading = { roman: "FAQs" },
  className = "",
}: {
  faqs: Faq[];
  eyebrow?: string;
  heading?: { roman: string; italic?: string };
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();
  const reduced = useReducedMotion();

  if (!faqs.length) return null;

  return (
    <section className={className}>
      {/* The centring lives here rather than on each page, so every FAQ on the
          site sits in the same column whatever its host section does with its
          own padding. 64rem is the editorial width: wide enough that a question
          and its answer read comfortably, narrow enough that neither runs the
          full bleed of a 1920 page.

          Only the block is centred. The rows inside stay left-aligned — a
          column of centred questions with a control on the right would have
          nothing to line up against. */}
      <div className="mx-auto w-full max-w-[64rem]">
        <Eyebrow as="h2">{eyebrow}</Eyebrow>
        <SectionHeading
          roman={heading.roman}
          italic={heading.italic}
          className="mt-4 max-w-[18ch]"
        />

        <ul className="mt-12 md:mt-16">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          const panelId = `${baseId}-panel-${i}`;
          const buttonId = `${baseId}-button-${i}`;
          return (
            <li key={faq.q} className="border-t border-rule last:border-b">
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  /* `text-left` matters: a button centres its text by default,
                     and these run to two lines on a phone. */
                  className="group flex w-full items-start justify-between gap-6 py-6 text-left md:py-8"
                >
                  <span className="display max-w-[26ch] text-step-2 transition-colors group-hover:text-blue">
                    {faq.q}
                  </span>
                  {/* The one piece of chrome. Blue ring, blue glyph, filling in
                      on hover and when open — the same accent the rest of the
                      site uses for a control. */}
                  <span
                    aria-hidden="true"
                    className={`mt-1 grid size-10 shrink-0 place-items-center rounded-full border transition-colors duration-300 md:size-12 ${
                      isOpen
                        ? "border-blue bg-blue text-ink"
                        : "border-rule text-blue group-hover:border-blue"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 md:size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14" />
                      {/* The vertical stroke is what turns the plus into a
                          minus. Rotated rather than swapped, so the change
                          reads as one movement. */}
                      <path
                        d="M12 5v14"
                        className={`origin-center transition-transform duration-300 ${
                          isOpen ? "rotate-90 opacity-0" : "rotate-0"
                        }`}
                      />
                    </svg>
                  </span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: reduced ? 0 : 0.42,
                      ease: EASE,
                    }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-[62ch] pb-8 pr-14 text-step-0 text-content-dim md:pb-10">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/**
 * `FAQPage` structured data, generated from the same array the section renders.
 *
 * Deliberately takes the identical `faqs` prop rather than its own copy, so the
 * schema cannot drift from what is on screen — Google's guidance is that the
 * two must match, and the simplest way to guarantee it is to make a second copy
 * impossible. Rendered as a plain script tag; the site has no other JSON-LD, so
 * there is nothing to merge with.
 */
export function FaqJsonLd({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // Content is ours and contains no user input; the only risk would be a
      // literal `</script>` in an answer, which the escape below removes.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(json).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default FAQ;
