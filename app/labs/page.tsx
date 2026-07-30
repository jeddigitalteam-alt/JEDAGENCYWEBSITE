import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/primitives";
import Tessellation from "@/components/labs/Tessellation";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Experiments from the Puzzle studio. A tessellation generator built with real physics — click to drop pieces, export the result.",
};

export default function LabsPage() {
  return (
    <section className="px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <Eyebrow>Labs — 01</Eyebrow>
      <h1 className="display mt-4 max-w-[18ch] text-step-5">
        Tessellation <em>generator</em>
      </h1>
      <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
        Pieces fall, collide and settle against each other. Drop enough of them
        and the pile tiles itself. Take the PNG if you want it — it’s yours.
      </p>

      <div className="mt-12">
        <Tessellation />
      </div>
    </section>
  );
}
