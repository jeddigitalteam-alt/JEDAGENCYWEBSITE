import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/primitives";
import RevealHeading from "@/components/motion/RevealHeading";
import CookieSettingsButton from "@/components/chrome/CookieSettingsButton";
import { SITE } from "@/lib/site";
import { PRIVACY, PRIVACY_UPDATED, type PrivacyBlock } from "@/lib/privacy";

const DESCRIPTION =
  "How Puzzle Studios collects and uses personal information — enquiries, Google Analytics, cookies and consent, and your rights under UK data protection law.";

export const metadata: Metadata = {
  /* The layout appends "— Puzzle", so this is the distinguishing half. */
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy Policy — Puzzle", description: DESCRIPTION },
};

/** The inline link treatment the Terms page uses for its email address. */
const INLINE =
  "break-words underline decoration-[color:var(--link-underline)] decoration-1 underline-offset-4 transition-colors hover:text-accent";

/**
 * Turns the tokens documented in `lib/privacy.ts` into elements: `{EMAIL}`,
 * `{COOKIE_SETTINGS}` and `[label](href)`. Everything else is plain text.
 */
function inline(text: string): ReactNode {
  const parts = text.split(/(\{EMAIL\}|\{COOKIE_SETTINGS\}|\[[^\]]+\]\([^)]+\))/);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part === "{EMAIL}") {
      return (
        <a key={i} href={`mailto:${SITE.email}`} className={INLINE}>
          {SITE.email}
        </a>
      );
    }
    if (part === "{COOKIE_SETTINGS}") {
      return (
        <CookieSettingsButton key={i} className={INLINE}>
          Cookie settings
        </CookieSettingsButton>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      return href.startsWith("/") ? (
        <Link key={i} href={href} className={INLINE}>
          {label}
        </Link>
      ) : (
        <a
          key={i}
          href={href}
          rel="noreferrer noopener"
          target="_blank"
          className={INLINE}
        >
          {label}
        </a>
      );
    }
    return part;
  });
}

/** One block — the same three treatments as the Terms page. */
function Block({ block }: { block: PrivacyBlock }) {
  switch (block.kind) {
    case "note":
      return (
        <aside className="border-l-2 border-blue pl-5 md:pl-6">
          <p className="mono text-content-dim">Important</p>
          <p className="mt-3 text-step-0 leading-relaxed">
            {inline(block.text ?? "")}
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
              <span className="text-step-0 leading-relaxed">{inline(item)}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p className="text-step-0 leading-relaxed">{inline(block.text ?? "")}</p>
      );
  }
}

/**
 * Privacy Policy. The Terms page's layout exactly — same reading column, same
 * linkable `<section>` per heading — so the two legal pages read as a pair.
 */
export default function PrivacyPage() {
  return (
    <article className="px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Legal</Eyebrow>
        <RevealHeading
          as="h1"
          className="display mt-4 text-step-4"
          roman="Privacy"
          italic="policy"
        />
        <p className="mono mt-6 text-content-dim">
          Last updated {PRIVACY_UPDATED}
        </p>

        <div className="mt-12 grid gap-12 border-t border-rule pt-10">
          {PRIVACY.map((section) => (
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
