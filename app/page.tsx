import Hero from "@/components/home/Hero";
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
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <ClientRail />
      <FitNotes />
      <ArticlesTeaser />
    </>
  );
}
