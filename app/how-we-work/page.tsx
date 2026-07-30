import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/primitives";
import ProcessTimeline from "@/components/process/ProcessTimeline";

export const metadata: Metadata = {
  title: "How we work",
  description:
    "Five stages, one team, no handover. How a Puzzle project actually runs from brief to thirty days after launch.",
};

export default function HowWeWorkPage() {
  return (
    <>
      <section className="px-5 pt-32 md:px-8 md:pt-40">
        <Eyebrow>Process</Eyebrow>
        <h1 className="display mt-4 max-w-[20ch] text-step-5">
          Five stages, and we <em>mean all five</em>
        </h1>
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          Most studios describe a process they abandon by week three. This is
          the one we actually run, including the parts that are unglamorous.
        </p>
      </section>

      <ProcessTimeline />

      <section className="px-5 py-24 md:px-8">
        <div className="rounded-2xl border border-rule bg-ink-raised p-8 md:p-12">
          <h2 className="display max-w-[20ch] text-step-3">
            Want this applied to <em>something specific</em>?
          </h2>
          <p className="mt-4 max-w-[52ch] text-step--1 text-content-dim">
            Build a scope on the services page and send it over, or just tell us
            what you’re trying to do.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="mono rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
            >
              Build a scope
            </Link>
            <Link
              href="/contact"
              className="mono rounded-full bg-coral px-5 py-2.5 text-ink transition-colors hover:bg-paper"
            >
              Start a project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
