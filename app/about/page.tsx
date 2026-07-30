import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/primitives";
import TeamBoard from "@/components/about/TeamBoard";

export const metadata: Metadata = {
  title: "About",
  description:
    "Puzzle is an eight-person design studio in London. Senior throughout, small on purpose.",
};

export default function AboutPage() {
  return (
    <>
      <section className="px-5 pt-32 md:px-8 md:pt-40">
        <Eyebrow>About</Eyebrow>
        <h1 className="display mt-4 max-w-[18ch] text-step-5">
          Eight people who <em>finish things</em>
        </h1>
        <div className="mt-8 grid max-w-4xl gap-5 text-step-1 text-content-dim">
          <p>
            Puzzle is a design studio in London. We started in 2019 because the
            work we cared about kept getting handed off halfway — designed by
            one team, built by another, and diluted at the seam.
          </p>
          <p>
            So we do both. The people who design your site are the people who
            build it, which removes the single most expensive translation step
            in the process.
          </p>
        </div>
      </section>

      <section data-invert className="mt-24 bg-surface px-5 py-20 text-content md:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              n: "01",
              h: "We say no",
              p: "If the brief describes the wrong problem, we'll say so before quoting. It costs us work occasionally and saves the project regularly.",
            },
            {
              n: "02",
              h: "One team, start to end",
              p: "No handover to an implementation partner. The person who drew it is the person who ships it.",
            },
            {
              n: "03",
              h: "We leave you the keys",
              p: "Tokens as code, documented rules, and an editor your team can actually use without us.",
            },
          ].map((item) => (
            <div key={item.n}>
              <p className="mono text-content-dim">{item.n}</p>
              <h2 className="display mt-3 text-step-2">{item.h}</h2>
              <p className="mt-3 text-step--1 text-content-dim">{item.p}</p>
            </div>
          ))}
        </div>
      </section>

      <TeamBoard />
    </>
  );
}
