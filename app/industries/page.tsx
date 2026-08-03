import type { Metadata } from "next";
import Link from "next/link";
import { INDUSTRIES } from "@/lib/industries";
import { Eyebrow } from "@/components/ui/primitives";
import CaseGrid from "@/components/industries/CaseGrid";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Sectors we know well — AI, e-commerce, fintech, machinery, sports, SaaS and B2B — and what we've learned working in each.",
};

export default function IndustriesPage() {
  return (
    <>
      <section className="px-5 pt-32 md:px-8 md:pt-40">
        <Eyebrow>Industries</Eyebrow>
        <h1 className="display mt-4 max-w-[20ch] text-step-5">
          Sectors we’ve <em>already made the mistakes in</em>
        </h1>
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          Domain knowledge mostly means knowing which shortcuts are expensive.
          Here’s where we have it.
        </p>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind, i) => (
            <li key={ind.slug} className="bg-surface">
              <Link
                href={`/industries/${ind.slug}`}
                className="group flex h-full flex-col justify-between p-6"
              >
                <span className="mono text-content-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-10 block">
                  <span className="display block text-step-2 transition-colors group-hover:text-blue">
                    {ind.name}
                  </span>
                  <span className="mt-2 block text-step--1 text-content-dim">
                    {ind.summary}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CaseGrid />
    </>
  );
}
