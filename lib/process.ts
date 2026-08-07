/**
 * The four stages shown on the homepage.
 *
 * Deliberately not the same list as the five on /work. That one is the studio's
 * internal working method, named the way we talk about it — "Rewrite the
 * brief", "Find the constraint". This is the client-facing shape of an
 * engagement: what happens, in order, and what you are handed at the end of
 * each part. Neither is a summary of the other, so they do not need to agree in
 * number and should not be merged.
 *
 * Each stage carries both the short line shown in the row and the longer copy
 * shown in its panel, so the row and the panel can never drift apart.
 */

export interface ProcessStage {
  /** Two digits, shown in the circle and in the panel's label. */
  n: string;
  /** Short form for the panel's mono label, e.g. "01 / DISCOVERY". */
  label: string;
  title: string;
  /** The line under the title in the row. */
  summary: string;
  /** Panel: the opening paragraph. */
  intro: string;
  /** Panel: under "What happens". */
  happens: string;
  /** Panel: under "What you get". */
  gives: string;
}

export const PROCESS: ProcessStage[] = [
  {
    n: "01",
    label: "Discovery",
    title: "Discovery & Strategy",
    summary:
      "We understand your business, audience and what the project actually needs to achieve.",
    intro:
      "Before we design anything, we make sure we're solving the right problem. We look at your business, audience, goals, existing brand and the practical constraints around the project.",
    happens:
      "We align on what needs to be built, who it needs to work for and what success should look like. Constraints, priorities and potential problems are identified early rather than discovered halfway through the project.",
    gives:
      "A clear direction, agreed scope, priorities and a shared understanding of what we're trying to achieve.",
  },
  {
    n: "02",
    label: "Design & build",
    title: "Design & Development",
    summary:
      "Ideas become purposeful digital experiences, designed and built around real goals.",
    intro:
      "Once the direction is clear, we turn it into something tangible. Structure, visual identity, interaction and technology are developed together rather than treated as separate handoffs.",
    happens:
      "We explore ideas, establish the visual and functional system, build key experiences and test decisions against real content and real constraints. Where development is involved, technical considerations are brought into the process early.",
    gives:
      "A purposeful design system and working digital experience built around the goals agreed during discovery.",
  },
  {
    n: "03",
    label: "Review",
    title: "Review & Refinement",
    summary:
      "Work is shared early, feedback is gathered and the strongest direction is refined.",
    intro:
      "Good work gets stronger through useful feedback. We share progress before everything feels finished so important decisions can still be challenged and improved.",
    happens:
      "You review work in context, we gather focused feedback and refine the strongest direction. Instead of saving everything for one final reveal, collaboration happens throughout the project — reducing surprises and unnecessary rework.",
    gives:
      "A thoroughly considered solution that has been reviewed, tested and refined before launch.",
  },
  {
    n: "04",
    label: "Launch",
    title: "Launch & Support",
    summary:
      "Everything is prepared, tested and delivered — with support available beyond launch.",
    intro:
      "Launch isn't simply handing over a folder and disappearing. Everything needs to be ready for the people who will actually use, manage or develop it next.",
    happens:
      "Final checks are completed, assets and files are organised, documentation or implementation guidance is prepared and the finished work is moved into production. Where relevant, we remain available to support improvements after launch.",
    gives:
      "A launch-ready final product, organised handoff and a clear route for ongoing support and future development.",
  },
];
