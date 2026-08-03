import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/primitives";
import Tessellation from "@/components/labs/Tessellation";
import PieceField from "@/components/labs/PieceField";
import TypeSplice from "@/components/labs/TypeSplice";
import SeamLines from "@/components/labs/SeamLines";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Experiments from the Puzzle studio — a physics tessellation generator, a reactive piece field, pointer-driven type and a scroll-driven seam system.",
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

      <div className="mt-28 md:mt-36">
        <Eyebrow as="h2">Labs — 02</Eyebrow>
        <h2 className="display mt-4 max-w-[18ch] text-step-4">
          Piece <em>field</em>
        </h2>
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          A lattice under tension — every piece leans away from the pointer and
          settles back the moment it passes.
        </p>
        <div className="mt-10">
          <PieceField />
        </div>
      </div>

      <div className="mt-28 md:mt-36">
        <Eyebrow as="h2">Labs — 03</Eyebrow>
        <h2 className="display mt-4 max-w-[18ch] text-step-4">
          Type <em>splice</em>
        </h2>
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          The line stays set and stays readable. Letters lift and open their
          spacing as the pointer crosses them, then close again.
        </p>
        <div className="mt-10">
          <TypeSplice />
        </div>
      </div>

      <div className="mt-28 md:mt-36">
        <Eyebrow as="h2">Labs — 04</Eyebrow>
        <h2 className="display mt-4 max-w-[18ch] text-step-4">
          Seam <em>system</em>
        </h2>
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          The 45° interlock the rest of the site is built on, drawn as a rule
          system that unzips along the seam as you scroll it.
        </p>
        <div className="mt-10">
          <SeamLines />
        </div>
      </div>
    </section>
  );
}
