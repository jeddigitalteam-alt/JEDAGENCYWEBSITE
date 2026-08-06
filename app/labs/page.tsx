import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/primitives";
import { LabSection } from "@/components/labs/labs-kit";
import PiecePhysics from "@/components/labs/PiecePhysics";
import SnapPuzzle from "@/components/labs/SnapPuzzle";
import TypeLab from "@/components/labs/TypeLab";
import SignalCanvas from "@/components/labs/SignalCanvas";
import NodeField from "@/components/labs/NodeField";
import ScrollAssembly from "@/components/labs/ScrollAssembly";
import RevealHeading from "@/components/motion/RevealHeading";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Six interactive experiments from the Puzzle studio — throwable physics pieces, a snap-together mark, a live type lab, a signal drawing surface, a node network and a scroll-driven assembly.",
};

export default function LabsPage() {
  return (
    <div className="pb-24 pt-32 md:pt-40">
      <header className="px-5 md:px-8">
        <Eyebrow>Labs</Eyebrow>
        <RevealHeading
        as="h1"
        className="display mt-4 max-w-[20ch] text-step-5"
        roman="Things we build to"
        italic="find out"
      />
        <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
          Six experiments you can actually operate. Drag them, break them,
          reset them — nothing here is a screensaver.
        </p>
      </header>

      <div className="px-5 md:px-8">
        {/* 01 — immersive, breaks the gutter */}
        <LabSection
          index="01"
          roman="Piece"
          italic="physics"
          line="Click to drop a piece, then grab one and throw it. They carry the momentum of the throw, tumble against each other and stay in the frame."
          bleed
        >
          <PiecePhysics />
        </LabSection>

        <LabSection
          index="02"
          roman="Snap"
          italic="together"
          line="Eight tiles, one arrangement. Drag each into its outline — it pulls in and locks when it is close enough."
        >
          <SnapPuzzle />
        </LabSection>

        <LabSection
          index="03"
          roman="Type"
          italic="lab"
          line="Set your own phrase, drive four properties live, then drag across the line to bend it."
        >
          <TypeLab />
        </LabSection>

        <LabSection
          index="04"
          roman="Signal"
          italic="canvas"
          line="Draw with a pointer or a finger. Move slowly for weight, quickly for a thin broken trace — and switch how the stroke resolves."
        >
          <SignalCanvas />
        </LabSection>

        {/* 05 — immersive, breaks the gutter */}
        <LabSection
          index="05"
          roman="Node"
          italic="field"
          line="Drag a node and the network reorganises around it. Click empty space to add one; set how far a connection can reach."
          bleed
        >
          <NodeField />
        </LabSection>
      </div>

      {/* 06 — full-bleed sticky stage, outside the gutter entirely */}
      <section className="mt-28 md:mt-36">
        <div className="px-5 md:px-8">
          <p className="mono text-content-dim">Labs — 06</p>
          <RevealHeading
            as="h2"
            className="display mt-3 max-w-[18ch] text-step-4"
            roman="Scroll"
            italic="assembly"
          />
          <p className="mt-4 max-w-[56ch] text-step-0 text-content-dim">
            Twelve fragments, one resolved block. The sequence is tied to scroll
            position, so going back up takes it apart again.
          </p>
        </div>
        <div className="mt-10">
          <ScrollAssembly />
        </div>
      </section>
    </div>
  );
}
