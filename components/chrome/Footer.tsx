"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { PIECE_A, PIECE_B, VIEWBOX } from "@/components/brand/puzzle-paths";

function LondonClock() {
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
      {time ? `${time} London` : "— London"}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-rule bg-surface px-5 pb-8 pt-16 md:px-8 md:pt-24">
      <div className="flex flex-col gap-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="display max-w-[16ch] text-step-3">
              Have something that <em>needs to fit</em>?
            </p>
            <Link
              href="/contact"
              className="mono mt-6 inline-flex rounded-full bg-coral px-6 py-3 text-ink transition-colors hover:bg-paper"
            >
              Start a project
            </Link>
          </div>

          <nav aria-label="Footer">
            <p className="mono mb-4 text-content-dim">Studio</p>
            <ul className="grid gap-2">
              {[
                ["Work", "/work"],
                ["Services", "/services"],
                ["Industries", "/industries"],
                ["How we work", "/how-we-work"],
                ["About", "/about"],
                ["Labs", "/labs"],
                ["Articles", "/articles"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-step--1 text-content-dim transition-colors hover:text-blue"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mono mb-4 text-content-dim">Elsewhere</p>
            <ul className="grid gap-2">
              {SITE.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="text-step--1 text-content-dim transition-colors hover:text-blue"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
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

        {/* Large interlocking wordmark — the mark's seam runs through the type. */}
        <div className="relative">
          <div className="flex items-end gap-3 md:gap-6">
            <svg
              viewBox={VIEWBOX}
              className="h-[12vw] w-[12vw] shrink-0 text-blue"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={PIECE_A} />
              <path d={PIECE_B} />
            </svg>
            <span
              className="wordmark select-none text-[18vw] lowercase leading-[0.75]"
              aria-hidden="true"
            >
              {SITE.wordmark}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
          <p className="mono text-content-dim">
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <LondonClock />
          <a
            href={`mailto:${SITE.email}`}
            className="mono transition-colors hover:text-blue"
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
