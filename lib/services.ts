export interface Phase {
  name: string;
  weeks: number;
}

/**
 * One panel of a showcase grid.
 *
 * `src` is a plain lowercase public path. The four files here arrived in
 * `public/work/Puzzle logo&images/` and are served from a copy rather than from
 * where they landed: a literal `&` in a directory name survives `next dev` and
 * fails outright in a production build — 404 on the raw file, and 400 from the
 * image optimiser, which reports the source as "not a valid image". That is the
 * same trap the article artwork hit, and the same answer.
 */
export type ShowcaseMedia =
  | {
      kind: "image";
      src: string;
      alt: string;
      /** The file's own, so the optimiser can pick a source width sensibly. */
      width: number;
      height: number;
    }
  | {
      kind: "video";
      src: string;
      /**
       * What the clip shows. A <video> has no alt attribute, so this is
       * announced as the element's label instead.
       */
      label: string;
    };

/**
 * A statement, a short argument beside it, and the work that proves it.
 *
 * Optional and per-service: only the pages with real media to show carry one,
 * and a service without it renders exactly as it did before.
 */
export interface Showcase {
  /** Roman + italic, the site's heading signature. Set at section-heading size. */
  statement: { roman: string; italic: string };
  /** Two or three paragraphs, set in the column beside the statement. */
  body: string[];
  /** Four panels, read left to right then top to bottom. */
  media: ShowcaseMedia[];
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
  /**
   * The editorial block on the service page: a statement, the approach beside
   * it, and a grid of the work. Where a service has one, it carries the
   * argument the hero paragraph used to make — so that paragraph is not
   * rendered as well, and the page opens on the headline alone.
   */
  showcase?: Showcase;
  /**
   * Render the page on paper rather than ink.
   *
   * Nothing is restyled to achieve it: `[data-invert]` reassigns the semantic
   * token layer, and every utility already reads from that layer, so the whole
   * page flips on one attribute. What it does need is for the two places that
   * name a raw colour — the phase tiles and the small blue markers — to pick
   * the surface-appropriate value, and for the header sitting over the page to
   * know which surface it is on.
   */
  paper?: boolean;
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
    /* Not rendered on this page — the showcase below carries this argument at
       length, and printing both would say the same thing twice within one
       screen. Kept as the service's canonical one-liner. */
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
    paper: true,
    showcase: {
      statement: {
        roman: "A site has to look like you and still be",
        italic: "fast, clear and worth the visit",
      },
      body: [
        "We design against your real content, at real widths, in the browser early. A layout that only holds at 1440px with copy nobody has written yet is not a design — it is a picture of one.",
        "Structure comes first: what the site is for, what someone needs to do on it, and the shape the content actually arrives in. Art direction goes on top of something that already works, so the visual design has something to be right about.",
        "Then the people who designed it build it. No handover document and no translation step, which is how a site stays as quick and as considered on its fortieth page as it was on the homepage.",
      ],
      media: [
        {
          kind: "image",
          src: "/work/web-design/south-downs.png",
          alt: "South Downs Plant & Machinery — the machine search on a phone, beside the dark enquiry dashboard",
          width: 1391,
          height: 1131,
        },
        {
          kind: "image",
          src: "/work/web-design/levant-tee.png",
          alt: "LEVANT — the 001 tee product page open on a phone against an orange set",
          width: 2000,
          height: 2000,
        },
        {
          kind: "image",
          src: "/work/web-design/bespoke-garden-decor.png",
          alt: "Bespoke Garden Decor — the products page, its handcrafted range laid out in a three-column grid",
          width: 2000,
          height: 2000,
        },
        {
          kind: "video",
          src: "/work/web-design/levant.mp4",
          label:
            "LEVANT — the 001 tee page in motion on a phone, against a coral set",
        },
      ],
    },
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
 * Is this route rendered on paper?
 *
 * The header is fixed over the page and lives outside it in the root layout, so
 * it cannot inherit the surface from the page it is sitting on — it has to ask.
 * Asked from `usePathname()`, which is resolved during SSR as well as on the
 * client, so the header renders in the right colours on the first paint rather
 * than flipping after hydration.
 */
export function isPaperRoute(pathname: string): boolean {
  const slug = /^\/services\/([^/]+)\/?$/.exec(pathname)?.[1];
  return slug ? getService(slug)?.paper === true : false;
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
