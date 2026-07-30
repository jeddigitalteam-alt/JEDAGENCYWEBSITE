import type { Metadata } from "next";
import WorkRail from "@/components/work/WorkRail";
import { Eyebrow } from "@/components/ui/primitives";
import { WORK } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects from Puzzle — brand identity, websites and digital products for companies in sport, fintech, health, AI and e-commerce.",
};

export default function WorkPage() {
  return (
    <section className="pb-24 pt-32 md:pt-40">
      <div className="px-5 md:px-8">
        <Eyebrow>{WORK.length} projects</Eyebrow>
        <h1 className="display mt-4 max-w-[18ch] text-step-5">
          Work we can <em>show you</em>
        </h1>
        <p className="mono mt-6 max-w-[52ch] text-content-dim">
          Drag, scroll or use the arrow keys.
        </p>
      </div>

      <div className="mt-16">
        <WorkRail />
      </div>
    </section>
  );
}
