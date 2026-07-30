export interface Phase {
  name: string;
  weeks: number;
}

export interface Service {
  slug: string;
  name: string;
  /** Nav + card one-liner. Says what you get, not how much we care. */
  summary: string;
  /** Longer intro on the service page. */
  intro: string;
  deliverables: string[];
  phases: Phase[];
  /** Roman/italic split for the service page headline. */
  headline: { roman: string; italic: string };
}

export const SERVICES: Service[] = [
  {
    slug: "brand-identity",
    name: "Brand identity",
    summary: "Naming, marks, type, and the rules that keep them intact.",
    intro:
      "Most identities fail in month seven, not week one — when someone needs a slide template at 11pm and the rules do not cover it. We build identities that survive being used by people who were not in the room.",
    deliverables: [
      "Positioning and messaging framework",
      "Wordmark, monogram and lockups",
      "Type system and scale",
      "Colour system with contrast ratios documented",
      "Usage rules and a working template set",
    ],
    phases: [
      { name: "Audit and positioning", weeks: 2 },
      { name: "Territories", weeks: 2 },
      { name: "Refinement", weeks: 2 },
      { name: "System and rules", weeks: 2 },
    ],
    headline: { roman: "An identity that", italic: "holds up unattended" },
  },
  {
    slug: "web-design",
    name: "Web design",
    summary: "Sites designed against real content and real constraints.",
    intro:
      "We design in the browser early, because a layout that only works at 1440px with perfect copy is not a design — it is a picture of one.",
    deliverables: [
      "Sitemap and content model",
      "Wireframes at three breakpoints",
      "Full design system in Figma",
      "Motion specification",
      "Handover with tokens as code",
    ],
    phases: [
      { name: "Structure", weeks: 1 },
      { name: "Art direction", weeks: 2 },
      { name: "Page design", weeks: 3 },
      { name: "System and handover", weeks: 1 },
    ],
    headline: { roman: "Sites that survive", italic: "real content" },
  },
  {
    slug: "web-development",
    name: "Web development",
    summary: "Next.js builds that stay fast after you start adding pages.",
    intro:
      "We build what we designed. Same team, so nothing gets lost in a handover document nobody reads.",
    deliverables: [
      "Next.js App Router build",
      "CMS integration and editor training",
      "Analytics and consent",
      "Performance budget, enforced in CI",
      "Deployment and a runbook",
    ],
    phases: [
      { name: "Setup and tokens", weeks: 1 },
      { name: "Component build", weeks: 3 },
      { name: "Integration", weeks: 2 },
      { name: "Launch", weeks: 1 },
    ],
    headline: { roman: "Built to stay", italic: "fast" },
  },
  {
    slug: "digital-product-design",
    name: "Digital product design",
    summary: "Interfaces for products people use every day, not once.",
    intro:
      "Product work rewards restraint. The tenth screen matters more than the first, and the empty state matters more than either.",
    deliverables: [
      "Flow mapping and job stories",
      "Interactive prototype",
      "Component library with states",
      "Empty, loading and error states designed",
      "Accessibility annotations",
    ],
    phases: [
      { name: "Discovery", weeks: 2 },
      { name: "Flows and prototype", weeks: 3 },
      { name: "Interface design", weeks: 3 },
      { name: "Library", weeks: 2 },
    ],
    headline: { roman: "Designed for the", italic: "tenth visit" },
  },
  {
    slug: "motion-video",
    name: "Motion and video",
    summary: "Motion with a reason, cut to the length it earns.",
    intro:
      "Motion should explain something or acknowledge something. If it does neither, it is a loading delay with ambition.",
    deliverables: [
      "Motion principles and timing scale",
      "Launch film or product demo",
      "Social cutdowns",
      "Lottie or code-based UI motion",
      "Sound design",
    ],
    phases: [
      { name: "Concept and script", weeks: 1 },
      { name: "Storyboard", weeks: 1 },
      { name: "Production", weeks: 2 },
      { name: "Edit and grade", weeks: 2 },
    ],
    headline: { roman: "Motion that", italic: "means something" },
  },
  {
    slug: "ai-design",
    name: "AI design",
    summary: "Interfaces for models that are wrong sometimes.",
    intro:
      "The hard part of AI design is not the chat box. It is designing for confidence, correction and refusal — so people can tell when to trust the output.",
    deliverables: [
      "Interaction model for uncertainty",
      "Prompt and result interface patterns",
      "Streaming, retry and failure states",
      "Evaluation surface for the team",
      "Guidance on disclosure",
    ],
    phases: [
      { name: "Capability mapping", weeks: 2 },
      { name: "Interaction model", weeks: 2 },
      { name: "Interface design", weeks: 3 },
      { name: "Testing with real output", weeks: 2 },
    ],
    headline: { roman: "Design for models that", italic: "get it wrong" },
  },
  {
    slug: "retainer",
    name: "Retainer",
    summary: "A standing arrangement for teams who keep shipping.",
    intro:
      "A fixed number of days a month, spent on whatever is most useful. No scoping ceremony for every small piece of work.",
    deliverables: [
      "Named team and fixed monthly days",
      "Shared board and weekly call",
      "Design system upkeep",
      "Quarterly review",
      "First refusal on your calendar",
    ],
    phases: [
      { name: "Onboarding", weeks: 1 },
      { name: "Rolling delivery", weeks: 4 },
    ],
    headline: { roman: "Standing capacity,", italic: "no ceremony" },
  },
];

export function getService(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * Scope estimate for the builder. Phases from separate services overlap in
 * practice, so total weeks are not a plain sum: each additional service adds a
 * diminishing amount of calendar time. Kept here so the board and the contact
 * form agree on the number.
 */
export function estimateScope(slugs: string[]) {
  const chosen = SERVICES.filter((s) => slugs.includes(s.slug));
  if (!chosen.length) return { weeks: 0, phases: [] as Phase[], services: chosen };

  const sorted = [...chosen].sort(
    (a, b) => sumWeeks(b.phases) - sumWeeks(a.phases),
  );
  const weeks = sorted.reduce((total, service, i) => {
    const own = sumWeeks(service.phases);
    // First service runs at full length; each subsequent one overlaps ~40%.
    return total + (i === 0 ? own : Math.round(own * 0.6));
  }, 0);

  const phases = dedupePhases(sorted.flatMap((s) => s.phases));
  return { weeks, phases, services: sorted };
}

function sumWeeks(phases: Phase[]) {
  return phases.reduce((n, p) => n + p.weeks, 0);
}

function dedupePhases(phases: Phase[]) {
  const seen = new Map<string, Phase>();
  for (const p of phases) {
    const existing = seen.get(p.name);
    if (!existing || p.weeks > existing.weeks) seen.set(p.name, p);
  }
  return [...seen.values()];
}
