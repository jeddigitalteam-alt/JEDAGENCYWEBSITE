/**
 * Case studies.
 *
 * Every entry here is a real project with real artwork. LEVANT is the only one
 * written up in full; the other two carry factual metadata and no invented
 * client outcomes. The demo entries that used to pad this list have been
 * removed, so counts shown around the site are genuine.
 *
 * IMAGE PATHS ARE CENTRALISED HERE ON PURPOSE. Swapping an asset means editing
 * the path here and nothing else — every tile, rail and hero reads from it.
 */

export interface Chapter {
  id: string;
  label: string;
}

export interface Swatch {
  name: string;
  /** CSS var reference or literal — LEVANT's clay tones come from photography. */
  value: string;
  note: string;
}

/** One screen inside the device showcase on a case study. */
export interface DeviceScreen {
  src: string;
  /** Short label — announced on change and shown beside the controls. */
  label: string;
  alt: string;
  /**
   * `object-position` for the 16:10 screen crop. These are real captures at
   * their own ratios, so each one is placed by hand to keep its subject inside
   * the aperture rather than centred blindly.
   */
  position?: string;
}

export interface CaseStudy {
  slug: string;
  client: string;
  sector: string;
  year: string;
  scope: string[];
  /** Grid tile one-liner. */
  summary: string;
  /** Industry slugs, for the filterable grid. */
  industries: string[];
  thumb: string;
  hero: string;
  /**
   * `object-position` for the 16:9 hero crop. Only needed where the source is
   * not already 16:9 and centring would cut the subject. Ignored when
   * `heroAspect` is set, because nothing is being cropped.
   */
  heroPosition?: string;
  /**
   * Native aspect ratio of the hero artwork, e.g. "1 / 1".
   *
   * Set this where the whole composition has to survive rather than be cropped
   * to the default 16:9 band. The hero then renders as a centred plate at the
   * artwork's own ratio, capped by viewport height, so the image is complete
   * with no letterbox bars inside the frame and no distortion. Omit for the
   * standard full-bleed 16:9 crop.
   */
  heroAspect?: string;
  /**
   * Share of the viewport height an `heroAspect` hero should fill, 0–100.
   *
   * The cap has to be expressed as a width, because the frame's width is what
   * drives its height through the aspect ratio — so the page turns this into
   * `ratio x N vh`. Defaults to 78, which is what a square hero was already
   * using; raise it where the artwork is the point of the opening.
   */
  heroViewport?: number;
  /** Screens shown inside the device showcase. */
  screens?: DeviceScreen[];
  /** Set only on fully built case studies. */
  full?: boolean;
  headline?: { roman: string; italic: string };
  chapters?: Chapter[];
  palette?: Swatch[];
  /**
   * Outcome tiles for a case study.
   *
   * Deliberately achievements rather than analytics: a numbered claim about the
   * work, not a client's commercial performance. Sell-through, order values,
   * return rates and the like are the client's data to publish, not ours — so
   * nothing here is a figure taken out of their account.
   */
  outcomes?: { n: string; label: string }[];
}

export const LEVANT_PALETTE: Swatch[] = [
  { name: "Court clay", value: "var(--clay)", note: "From the surface itself" },
  { name: "Baseline", value: "var(--ink)", note: "Kit black, near-neutral" },
  { name: "Service", value: "var(--coral)", note: "Single CTA accent" },
  { name: "Chalk", value: "var(--paper-dim)", note: "Line markings" },
];

export const WORK: CaseStudy[] = [
  {
    slug: "levant",
    client: "LEVANT",
    sector: "Sports apparel",
    year: "2025",
    scope: ["Brand identity", "E-commerce build", "Launch campaign"],
    summary:
      "Performance tennis apparel, taken from a name to an inaugural drop that sold through in nine days.",
    industries: ["sports", "ecommerce"],
    thumb: "/work/levant/thumb-campaign.png",
    hero: "/work/levant/hero-editorial.png",
    // 1536x1024 artwork, shown whole and given most of the first screen.
    heroAspect: "3 / 2",
    heroViewport: 88,
    screens: [
      {
        src: "/work/levant/screen-home.png",
        label: "Home",
        alt: "LEVANT home page — the 001 drop announcement",
        // Top-aligned so the site's own nav is whole rather than sliced; the
        // dead black below the fold is what gets dropped instead.
        position: "center top",
      },
      {
        src: "/work/levant/screen-gallery.png",
        label: "Gallery",
        alt: "LEVANT product gallery — back view of the 001 performance top",
        // Portrait capture, so roughly half of it fits the aperture. Framed on
        // the arced back print with the gallery arrows still showing, which is
        // what makes it read as a page rather than a photograph.
        position: "center 12%",
      },
      {
        src: "/work/levant/screen-editorial.png",
        label: "Editorial",
        alt: "LEVANT editorial section — pull quote over clay-court photography",
        // Top-aligned to keep the pull quote. Framed on the photograph alone it
        // stopped reading as a web page at all.
        position: "center top",
      },
    ],
    full: true,
    headline: { roman: "Play like you", italic: "mean it" },
    chapters: [
      { id: "brief", label: "The brief" },
      { id: "identity", label: "Identity" },
      { id: "palette", label: "Palette" },
      { id: "product", label: "Product pages" },
      { id: "outcome", label: "Outcome" },
    ],
    palette: LEVANT_PALETTE,
    outcomes: [
      { n: "01", label: "Launched on schedule" },
      { n: "02", label: "Clearer buying journey" },
      { n: "03", label: "Conversion-led design" },
      { n: "04", label: "Built to scale" },
    ],
  },
  {
    slug: "south-downs",
    client: "South Downs Plant & Machinery",
    sector: "Plant and machinery",
    year: "2025",
    scope: ["Web design", "Web development"],
    summary:
      "A searchable stock catalogue and an export enquiry route, for a dealer selling worldwide.",
    industries: ["machinery", "b2b", "ecommerce"],
    thumb: "/work/south-downs/home.png",
    hero: "/work/south-downs/export-loading.png",
    heroPosition: "center 38%",
  },
  {
    slug: "bespoke-garden-decor",
    client: "Bespoke Garden Decor",
    sector: "Made-to-measure timber",
    year: "2025",
    scope: ["Web design", "Web development"],
    summary:
      "A made-to-measure workshop given a product range you can actually browse before enquiring.",
    industries: ["ecommerce", "b2b"],
    thumb: "/work/bespoke-garden-decor/home.png",
    hero: "/work/bespoke-garden-decor/products.png",
    heroPosition: "center 78%",
  },
];

export function getCase(slug: string) {
  return WORK.find((w) => w.slug === slug);
}

/**
 * Whether a study has a case-study page behind it.
 *
 * Only written-up studies get a route, so everything else shows as a static
 * card: no link, no pointer affordance, and not reachable by keyboard. This is
 * the single source for that decision — tiles, the rail, the industries grid
 * and `generateStaticParams` all read it, so a card can never advertise a page
 * that does not exist.
 */
export function hasCaseStudy(study: CaseStudy) {
  return study.full === true;
}

export const LEVANT = WORK[0];
