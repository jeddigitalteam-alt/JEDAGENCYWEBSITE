import Hero from "@/components/home/Hero";
import ProcessLadder from "@/components/home/ProcessLadder";
import Testimonial from "@/components/home/Testimonial";
import {
  ArticlesTeaser,
  ClientRail,
  FitNotes,
  SelectedWork,
} from "@/components/home/sections";

/**
 * The service rail is not listed here on purpose: it now renders inside the
 * hero, so the cards are moving on the first screen. There is no second copy
 * of it further down the page.
 *
 * `ProcessLadder` and `FitNotes` are both about how the studio works, and they
 * are deliberately not adjacent: the testimonial sits between them so the page
 * alternates between what we claim and what a client said, rather than running
 * two claims together.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <ClientRail />
      <ProcessLadder />
      <Testimonial />
      <FitNotes />
      <ArticlesTeaser />
    </>
  );
}
