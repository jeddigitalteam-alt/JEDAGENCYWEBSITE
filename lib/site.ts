import { SERVICES } from "./services";
import { INDUSTRIES } from "./industries";

export const SITE = {
  name: "Puzzle",
  /** Wordmark is set lowercase. */
  wordmark: "puzzle",
  email: "hello@puzzle.studio",
  location: "Hampshire, UK",
  timezone: "Europe/London",
  address: ["Hampshire", "United Kingdom"],
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
} as const;

export interface NavLink {
  label: string;
  href: string;
  /** Only present on mega-menu column items. */
  description?: string;
}

export const PRIMARY_NAV: {
  label: string;
  href: string;
  columns?: { heading: string; links: NavLink[] }[];
}[] = [
  { label: "Work", href: "/work" },
  {
    label: "Services",
    href: "/services",
    columns: [
      {
        heading: "Services",
        links: SERVICES.map((s) => ({
          label: s.name,
          href: `/services/${s.slug}`,
          description: s.summary,
        })),
      },
      {
        heading: "Industries",
        links: INDUSTRIES.map((i) => ({
          label: i.name,
          href: `/industries/${i.slug}`,
          description: i.summary,
        })),
      },
    ],
  },
  /* "How we work" is no longer a top-level destination: the process lives on
     the work page, under the projects it produced. */
  { label: "About", href: "/about" },
  { label: "Labs", href: "/labs" },
  { label: "Articles", href: "/articles" },
];

/** Flat list for the ⌘K palette. */
export const ALL_ROUTES: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  // Still findable by name in the palette — it just resolves to the section.
  { label: "How we work", href: "/work#how-we-work" },
  { label: "About", href: "/about" },
  { label: "Labs", href: "/labs" },
  { label: "Articles", href: "/articles" },
  { label: "Contact", href: "/contact" },
  ...SERVICES.map((s) => ({
    label: `Services — ${s.name}`,
    href: `/services/${s.slug}`,
  })),
  ...INDUSTRIES.map((i) => ({
    label: `Industries — ${i.name}`,
    href: `/industries/${i.slug}`,
  })),
];

/** Placeholder client names for the marquee. Real logos still needed. */
/**
 * Real clients only. The marquee repeats this list to fill its track — see
 * ClientRail — so three names is enough to loop seamlessly.
 */
export const CLIENTS = [
  "LEVANT",
  "SOUTH DOWNS PLANT & MACHINERY",
  "BESPOKE GARDEN DECOR",
] as const;
