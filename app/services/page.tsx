import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { Eyebrow } from "@/components/ui/primitives";
import ScopeBuilder from "@/components/services/ScopeBuilder";
import RevealHeading from "@/components/motion/RevealHeading";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Brand identity, web design, web development, digital product design, motion, AI design and retainers — from a Hampshire studio.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="px-5 pt-32 md:px-8 md:pt-40">
        <Eyebrow>Services</Eyebrow>
        <RevealHeading
        as="h1"
        className="display mt-4 max-w-[18ch] text-step-5"
        roman="Seven ways we"
        italic="can help"
      />
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          Most projects use two or three of these together. If you already know
          the shape of the work, build it on the board below and send it over.
        </p>

        <ul className="mt-16 border-t border-rule">
          {SERVICES.map((s, i) => (
            <li key={s.slug} className="border-b border-rule">
              <Link
                href={`/services/${s.slug}`}
                className="group flex flex-wrap items-baseline gap-x-8 gap-y-2 py-7"
              >
                <span className="mono text-content-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display min-w-[10ch] flex-1 text-step-3 transition-colors group-hover:text-blue">
                  {s.name}
                </span>
                <span className="max-w-[46ch] flex-1 text-step--1 text-content-dim">
                  {s.summary}
                </span>
                <span
                  className="mono text-content-dim transition-colors group-hover:text-blue"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ScopeBuilder />
    </>
  );
}
