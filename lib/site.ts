import { SERVICES } from "./services";
import { INDUSTRIES } from "./industries";

export const SITE = {
  name: "Puzzle",
  /** Wordmark is set lowercase. */
  wordmark: "puzzle",
  email: "hello@puzzle.studio",
  location: "London, UK",
  latitude: "51.5074° N",
  timezone: "Europe/London",
  address: ["Unit 4, Bevenden Street", "London N1 6BH", "United Kingdom"],
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "Are.na", href: "https://are.na" },
    { label: "GitHub", href: "https://github.com" },
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
  { label: "How we work", href: "/how-we-work" },
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
  { label: "How we work", href: "/how-we-work" },
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
export const CLIENTS = [
  "LEVANT",
  "Northbank",
  "Meridian",
  "Kestrel",
  "Atlas Freight",
  "Harbour Goods",
  "Orbit Labs",
  "Pellum",
  "Fieldwork",
  "Verity",
] as const;
