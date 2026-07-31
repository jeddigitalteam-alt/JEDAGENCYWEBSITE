/**
 * Case studies.
 *
 * LEVANT is the real, fully written one. The rest are credible placeholders —
 * they carry honest metadata and copy but no invented client outcomes.
 *
 * IMAGE PATHS ARE CENTRALISED HERE ON PURPOSE. Swapping an asset means editing
 * the path here and nothing else — every tile, rail and hero reads from it.
 *
 * LEVANT now carries real supplied artwork. The remaining entries still point
 * at generated placeholders at the correct aspect ratio.
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
   * not already 16:9 and centring would cut the subject — LEVANT's hero is
   * square, so it is pulled down to keep the devices and the wordmark in frame.
   * Omit to centre.
   */
  heroPosition?: string;
  /** Set only on fully built case studies. */
  full?: boolean;
  headline?: { roman: string; italic: string };
  chapters?: Chapter[];
  palette?: Swatch[];
  metrics?: { label: string; value: string }[];
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
    hero: "/work/levant/hero-devices-clay.png",
    heroPosition: "center 35%",
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
    metrics: [
      { label: "Sell-through", value: "9 days" },
      { label: "Launch AOV", value: "£184" },
      { label: "Return rate", value: "4.1%" },
      { label: "LCP, mobile", value: "1.2s" },
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
    industries: ["b2b", "ecommerce"],
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
  {
    slug: "meridian-health",
    client: "Meridian Health",
    sector: "Patient software",
    year: "2025",
    scope: ["Product design", "Design system"],
    summary: "A referral tool redesigned around the interrupted session.",
    industries: ["healthcare", "saas"],
    thumb: "/work/placeholder/meridian.jpg",
    hero: "/work/placeholder/meridian.jpg",
  },
  {
    slug: "northbank",
    client: "Northbank",
    sector: "Business banking",
    year: "2024",
    scope: ["Brand identity", "Web design"],
    summary: "An identity built to make fees legible rather than invisible.",
    industries: ["fintech", "b2b"],
    thumb: "/work/placeholder/northbank.jpg",
    hero: "/work/placeholder/northbank.jpg",
  },
  {
    slug: "kestrel",
    client: "Kestrel",
    sector: "Developer tooling",
    year: "2025",
    scope: ["Web design", "Web development"],
    summary: "Docs treated as the primary brand surface, not an afterthought.",
    industries: ["saas", "ai"],
    thumb: "/work/placeholder/kestrel.jpg",
    hero: "/work/placeholder/kestrel.jpg",
  },
  {
    slug: "atlas-freight",
    client: "Atlas Freight",
    sector: "Logistics",
    year: "2024",
    scope: ["Digital product design"],
    summary: "A dispatch board that four different roles can read at a glance.",
    industries: ["b2b"],
    thumb: "/work/placeholder/atlas.jpg",
    hero: "/work/placeholder/atlas.jpg",
  },
  {
    slug: "harbour-goods",
    client: "Harbour Goods",
    sector: "Homeware retail",
    year: "2024",
    scope: ["E-commerce build", "Motion"],
    summary: "Product photography given room to do the selling.",
    industries: ["ecommerce"],
    thumb: "/work/placeholder/harbour.jpg",
    hero: "/work/placeholder/harbour.jpg",
  },
  {
    slug: "orbit-labs",
    client: "Orbit Labs",
    sector: "Applied research",
    year: "2025",
    scope: ["AI design", "Web design"],
    summary: "An evaluation surface that makes model failure visible.",
    industries: ["ai"],
    thumb: "/work/placeholder/orbit.jpg",
    hero: "/work/placeholder/orbit.jpg",
  },
  {
    slug: "pellum",
    client: "Pellum",
    sector: "Payments",
    year: "2024",
    scope: ["Brand identity", "Web development"],
    summary: "A payments brand that survives being set at 11px.",
    industries: ["fintech"],
    thumb: "/work/placeholder/pellum.jpg",
    hero: "/work/placeholder/pellum.jpg",
  },
  {
    slug: "fieldwork",
    client: "Fieldwork",
    sector: "Research platform",
    year: "2023",
    scope: ["Digital product design", "Design system"],
    summary: "Twelve product teams, one component library they actually use.",
    industries: ["saas", "b2b"],
    thumb: "/work/placeholder/fieldwork.jpg",
    hero: "/work/placeholder/fieldwork.jpg",
  },
  {
    slug: "sable-court",
    client: "Sable Court",
    sector: "Racquet sports",
    year: "2023",
    scope: ["Brand identity", "Motion"],
    summary: "A club rebrand that reads from the back of the stand.",
    industries: ["sports"],
    thumb: "/work/placeholder/sable.jpg",
    hero: "/work/placeholder/sable.jpg",
  },
  {
    slug: "verity",
    client: "Verity",
    sector: "Insurance",
    year: "2023",
    scope: ["Web design", "Web development"],
    summary: "Policy documents made readable without losing precision.",
    industries: ["fintech", "b2b"],
    thumb: "/work/placeholder/verity.jpg",
    hero: "/work/placeholder/verity.jpg",
  },
  {
    slug: "ground-station",
    client: "Ground Station",
    sector: "Climate data",
    year: "2025",
    scope: ["Digital product design", "AI design"],
    summary: "Forecast uncertainty shown as a range, never a single number.",
    industries: ["ai", "saas"],
    thumb: "/work/placeholder/ground.jpg",
    hero: "/work/placeholder/ground.jpg",
  },
];

export function getCase(slug: string) {
  return WORK.find((w) => w.slug === slug);
}

export const LEVANT = WORK[0];
