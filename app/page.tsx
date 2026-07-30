import Hero from "@/components/home/Hero";
import ServicesPanels from "@/components/home/ServicesPanels";
import {
  ArticlesTeaser,
  ClientRail,
  FitNotes,
  SelectedWork,
} from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesPanels />
      <SelectedWork />
      <ClientRail />
      <FitNotes />
      <ArticlesTeaser />
    </>
  );
}
