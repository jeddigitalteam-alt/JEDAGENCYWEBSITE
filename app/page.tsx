import Hero from "@/components/home/Hero";
import ProcessLadder from "@/components/home/ProcessLadder";
import {
  ArticlesTeaser,
  ClientRail,
  SelectedWork,
  Testimonials,
} from "@/components/home/sections";

/**
 * The service rail is not listed here on purpose: it now renders inside the
 * hero, so the cards are moving on the first screen. There is no second copy
 * of it further down the page.
 *
 * `ProcessLadder` is what the studio claims; `Testimonials` is what clients
 * said afterwards. They sit next to each other in that order on purpose — the
 * claim, then the corroboration.
 *
 * The two quote sections were merged into one. They used to be separated, with
 * the heading sitting above only the second, so it read as introducing that
 * quote rather than the pair.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <ClientRail />
      <ProcessLadder />
      <Testimonials />
      <ArticlesTeaser />
    </>
  );
}
