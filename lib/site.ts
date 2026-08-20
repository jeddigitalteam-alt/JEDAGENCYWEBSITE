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

/**
 * Channels that are wired up but not yet pointed anywhere real.
 *
 * **Both of these are `null` on purpose.** There is no Puzzle phone number and
 * no Facebook page anywhere in this repository, so there is nothing to build a
 * `wa.me` link out of and nothing to link a Facebook icon to. Everything that
 * consumes them — the footer icons, `WhatsAppCta`, the WhatsApp strips on the
 * long service pages — checks first and renders nothing when the value is
 * missing, rather than shipping a link that 404s or, worse, messages a stranger.
 *
 * Fill either one in and every place that uses it starts working at once. That
 * is the only change needed; nothing else references a number directly.
 *
 * (Note: the number printed on the business cards in
 * `/work/brand-identity/puzzle-stationery.png` is +44 20 7946 xxxx, which is
 * Ofcom's reserved range for fiction. It is mockup artwork, not a contact.)
 */
export const CONTACT_CHANNELS: {
  /** International format, digits and spaces — e.g. "+44 7700 900000". */
  whatsappNumber: string | null;
  facebookUrl: string | null;
} = {
  whatsappNumber: null,
  facebookUrl: null,
};

/** The one message every WhatsApp entry point opens with. */
export const WHATSAPP_PREFILL =
  "Hi Puzzle, I have an idea I'd like to talk through.";

/**
 * The `wa.me` link, built once from the configured number.
 *
 * Returns `null` when no number is set, which is the signal every caller uses
 * to render nothing at all. `wa.me` wants digits only — no plus, no spaces —
 * and the prefilled text has to be percent-encoded.
 */
export function whatsappHref(message: string = WHATSAPP_PREFILL): string | null {
  const number = CONTACT_CHANNELS.whatsappNumber;
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

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
  /* Services and Industries are two top-level destinations with a panel each,
     not one panel with two columns. They answer different questions — what we
     do, and who we have done it for — and burying the second inside the first
     made it findable only by someone already looking for the first. Neither
     list is duplicated: each appears under exactly one heading. */
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
    ],
  },
  {
    label: "Industries",
    href: "/industries",
    columns: [
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
