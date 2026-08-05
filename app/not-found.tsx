import type { Metadata } from "next";
import BrokenPiece from "@/components/chrome/BrokenPiece";
import RevealHeading from "@/components/motion/RevealHeading";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="grid min-h-svh place-items-center px-5 py-32 md:px-8">
      <div className="w-full max-w-4xl">
        <p className="mono text-content-dim">Error 404</p>
        <RevealHeading
        as="h1"
        className="display mt-4 max-w-[16ch] text-step-5"
        roman="This piece"
        italic="doesn’t fit"
      />
        <p className="mt-6 max-w-[46ch] text-step-0 text-content-dim">
          There’s no page at this address. It may have moved, or the link may
          have been mistyped. Drag the loose piece back into its notch, or take
          one of the routes below.
        </p>
        <BrokenPiece />
      </div>
    </section>
  );
}
