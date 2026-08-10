"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import PuzzleSiteLogo from "@/components/brand/PuzzleSiteLogo";
import { SOCIAL_MARKS } from "@/components/brand/social-marks";

/**
 * The footer's call to action, on the blue field.
 *
 * Not `buttonClass("primary")`: that fill IS `--blue`, which is the footer's
 * background here, and `ghost` reads as a hairline nothing on a saturated
 * field. Ink on blue is the same 7.4:1 pairing the primary button uses, only
 * the other way round — so the pill is the darkest thing in the footer and
 * carries `--paper` at 19:1.
 *
 * Exported because the homepage peek shows the same call to action in a smaller
 * box, and there should be one definition of what it looks like. Padding is the
 * caller's, since that is the only thing that differs between the two.
 */
export const footerCta = (className = "") =>
  `mono inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink text-paper transition-colors duration-200 hover:bg-ink-raised active:scale-[0.98] ${className}`;

const COLUMN_LINK =
  "text-step--1 text-content-dim transition-colors hover:text-content";

/** Unchanged from the previous footer — these are working links. */
const STUDIO: [label: string, href: string][] = [
  ["Work", "/work"],
  ["Services", "/services"],
  ["Industries", "/industries"],
  ["How we work", "/work#how-we-work"],
  ["About", "/about"],
  ["Labs", "/labs"],
  ["Articles", "/articles"],
];

function StudioClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: SITE.timezone,
        }).format(new Date()),
      );
    // First paint is deferred one frame rather than set synchronously in the
    // effect body; the placeholder covers that single frame.
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  // Rendered null on the server — a server-rendered clock would hydrate wrong.
  return (
    <span className="mono tabular-nums text-content-dim">
      {time ? `${time} Hampshire` : "— Hampshire"}
    </span>
  );
}

function Column({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mono mb-4 text-content-dim">{label}</p>
      <ul className="grid gap-2">{children}</ul>
    </div>
  );
}

/**
 * Routes where the footer's pitch is redundant, because the page IS that. One
 * variant, decided from the pathname, rather than a second copy of the footer:
 * everything else — navigation, services, social, address, wordmark, clock,
 * email — is identical, and the columns simply move up to fill the space the
 * pitch left behind.
 */
const NO_PITCH = new Set(["/contact"]);

/**
 * The closing section of every page: a full-bleed field of `--blue`.
 *
 * `data-site-footer` is the handle `FooterReveal` measures; the `.site-footer`
 * class reassigns the semantic token layer to ink-on-blue exactly the way
 * `[data-invert]` reassigns it to ink-on-paper, so every component and utility
 * inside — `text-content-dim`, `border-rule`, the clock — flips with no
 * per-element colours. See app/globals.css.
 *
 * Height matters here in a way it did not before: the reveal pins this to the
 * bottom of the window, and anything taller than the window cannot be pinned to
 * it, so it falls back to normal flow instead. Density is therefore a feature —
 * the pitch is a cell of the link grid rather than a band above it, and the
 * wordmark is clamped rather than a bare `18vw`. Together those take the footer
 * from ~830px to ~560 at 1440, which is the difference between the reveal
 * running on an ordinary laptop and not.
 */
export function Footer() {
  const pathname = usePathname();
  const pitch = !NO_PITCH.has(pathname);

  return (
    <footer
      data-site-footer
      /* No `pb-*` utility: the bottom padding has to fold in the safe-area
         inset, so it is set once in globals.css alongside the rest of the
         field. */
      className="site-footer px-5 pt-14 md:px-8 md:pt-16"
    >
      <div className="mx-auto flex w-full max-w-[120rem] flex-col gap-10">
        {/* The pitch is a cell of the same grid as the link columns rather than
            a band above them. That is the difference between a footer that is
            600px tall and one that is 830 — and 830 is taller than the window
            on an ordinary laptop, which is the one thing that switches the
            reveal off. It also reads better: the invitation and the map of the
            site are one row, not two stacked blocks. */}
        <div
          className={
            pitch
              ? "grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
              : "grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-3"
          }
        >
          {pitch ? (
            <div className="col-span-2 lg:col-span-1 lg:pr-10">
              <p className="mono text-content-dim">Next step</p>
              <p className="display mt-3 max-w-[14ch] text-step-3">
                Want to work <em>with us</em>?
              </p>
              <Link href="/contact" className={footerCta("mt-6 px-6 py-3")}>
                Get in touch
              </Link>
            </div>
          ) : null}

          <Column label="Studio">
            {STUDIO.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className={COLUMN_LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </Column>

          <Column label="Services">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className={COLUMN_LINK}>
                  {s.name}
                </Link>
              </li>
            ))}
          </Column>

          {/* Spans the row below `lg`, where the grid is two columns and this
              is the odd one out — otherwise it sits in a half-width column
              with the address wrapping for no reason. */}
          <div className="col-span-2 lg:col-span-1">
            <p className="mono mb-4 text-content-dim">Elsewhere</p>
            {/* Marks rather than words. The name is still the accessible name
                of the link, so nothing is lost to a screen reader or to search
                — only the visible label changes. Sized at 1.25rem inside a
                2.5rem target, which keeps the tap area past the 44px floor on
                a phone while the glyph itself stays quiet. */}
            <ul className="flex items-center gap-1">
              {SITE.social.map((s) => {
                const Mark = SOCIAL_MARKS[s.label];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      rel="noreferrer noopener"
                      target="_blank"
                      aria-label={s.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-content-dim transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_12%,transparent)] hover:text-content"
                    >
                      <Mark className="h-5 w-5" />
                    </a>
                  </li>
                );
              })}
            </ul>
            <address className="mono mt-6 not-italic leading-relaxed text-content-dim">
              {SITE.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        </div>

        {/* The lockup, closing the page. The mark keeps its artwork blue, which
            is a shade off this field, so the keyline is ink here rather than
            the white it carries on the ink background — it has to be the thing
            that draws the contour, and white would be the one 2.6:1 element in
            a footer built to avoid exactly that. */}
        {/* The closing lockup, in the brand's white-on-blue treatment: white
            keyline, white wordmark, and the piece filled with `--blue` — the
            footer's own background colour — so the field reads as showing
            through the outline rather than as a patch sitting on it. The
            artwork's sampled blue is a shade off this one and did exactly that.
            Both are props on the shared component; the header's mark and every
            other instance are untouched.

            White here is a mark, not text: it is aria-hidden, and the type that
            has to be read is ink. Clamped rather than a bare `vw` because on a
            wide monitor 13vw of wordmark is 330px of type, and every pixel of
            it is footer height the reveal has to fit inside the window. */}
        <div className="flex items-end gap-3 md:gap-5">
          <PuzzleSiteLogo
            keyline="var(--paper)"
            body="var(--blue)"
            className="h-[clamp(2rem,6.5vw,5.5rem)] w-[clamp(2rem,6.5vw,5.5rem)] shrink-0"
          />
          <span
            className="wordmark select-none text-[clamp(2.75rem,10vw,9rem)] lowercase leading-[0.75] text-paper"
            aria-hidden="true"
          >
            {SITE.wordmark}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
          <p className="mono text-content-dim">
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <StudioClock />
          <a
            href={`mailto:${SITE.email}`}
            className="mono transition-colors hover:text-content"
            style={{ color: "var(--link)" }}
          >
            {SITE.email}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
