import { SERVICES } from "./services";

export const SITE = {
  name: "Puzzle",
  /** Wordmark is set lowercase. */
  wordmark: "puzzle",
  /**
   * The single public-facing enquiry address.
   *
   * Every place the address appears — the contact page, the footer, the About
   * page's closing block and the contact form's fallback — reads this value and
   * builds its own `mailto:` from it. Nothing hardcodes an address, so changing
   * Puzzle's enquiry email is this one line and nothing else.
   *
   * It replaced a placeholder on the old puzzle.studio domain, which was never
   * a live mailbox. The literal is not repeated here so that grepping the repo
   * for the old address returns nothing at all.
   */
  email: "enquiries@puzzlestudios.co.uk",
  /** Compact form, for anywhere a single line is wanted. */
  location: "Hampshire, SO21 3JU",
  timezone: "Europe/London",
  /**
   * The studio address, one line per element. Rendered as-is inside
   * `<address>` on the contact page and in the footer, so the order here is
   * the order on screen.
   *
   * County, postcode, country — and nothing else. There is no street, no
   * building and no town in this list because none has been supplied, and an
   * address is the last place to guess. The postcode's second character is the
   * letter O, not a zero.
   */
  address: ["Hampshire", "SO21 3JU", "United Kingdom"],
  /**
   * The postcode on its own, for the map link to search on. Derived from
   * nothing else, so `mapsHref` below cannot drift from the address above.
   */
  postcode: "SO21 3JU",
  /**
   * Instagram and LinkedIn. Facebook and WhatsApp live in `CONTACT_CHANNELS`
   * below, because those two are contact routes as well as profiles.
   *
   * `href` may be `null`, and LinkedIn's is. Both of these were the bare
   * `https://instagram.com` and `https://linkedin.com` — the sites themselves,
   * not Puzzle accounts — which is worse than no link at all: it looks
   * deliberate and sends people to a login page. Instagram now has its real
   * profile; LinkedIn keeps `null` until there is a verified company URL, and
   * the footer renders its icon without a link exactly as it does Facebook's.
   */
  social: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/puzzlestudiosuk/",
    },
    { label: "LinkedIn", href: null },
  ] as { label: "Instagram" | "LinkedIn"; href: string | null }[],
} as const;

/**
 * The contact channels, in one place.
 *
 * **WhatsApp is live.** The verified WhatsApp Business number below is the
 * single source of truth for it: the footer icon and every `WhatsAppCta` on the
 * site build their link from `whatsappHref()`, and no component holds a number
 * of its own. Changing it is this one value.
 *
 * **Facebook and the review URL are still `null`, on purpose.** There is no
 * Puzzle Facebook page and no verified review destination in this repository.
 * Everything that consumes them checks first and renders the graphic without a
 * link rather than shipping one that 404s. Fill either in and it activates with
 * no other change.
 *
 * (Note: the number printed on the business cards in
 * `/work/brand-identity/puzzle-stationery.png` is in Ofcom's reserved range for
 * fiction. It is mockup artwork, not a contact, and is not wired to anything.)
 */
export const CONTACT_CHANNELS: {
  /**
   * The Puzzle WhatsApp Business number, in international format.
   *
   * Written the readable way, with the plus and the spaces — `whatsappHref`
   * strips everything that is not a digit, so the format here is for whoever
   * reads this file rather than for `wa.me`.
   */
  whatsappNumber: string | null;
  facebookUrl: string | null;
  /**
   * Where "Leave a review" points — a Google Business profile, a Trustpilot
   * page, whichever you use. `null` for the same reason as the two above:
   * there is no verified review destination anywhere in this repository, and
   * the CTA renders as a finished graphic without one rather than guessing.
   */
  reviewUrl: string | null;
} = {
  /* The verified Puzzle WhatsApp Business account. This is the only phone
     number the site exposes anywhere, and it is a business line — no personal
     number appears in this repository. */
  whatsappNumber: "+44 7351 392373",
  /* The verified Puzzle Studios page. The URL people copy out of the app
     carries share and tracking parameters — `?mibextid=`, `?rdid=`, a
     `share/` prefix — and none of that belongs on the site, so this is the
     bare canonical form. */
  facebookUrl: "https://www.facebook.com/profile.php?id=61594104050246",
  reviewUrl: null,
};

/**
 * "Open in maps", built from the postcode alone.
 *
 * A postcode search rather than a pin: there are no coordinates and no street
 * address to place one with, and inventing either would put a marker on a
 * building that is not ours. OpenStreetMap is what the contact page already
 * linked to — it needs no account and no API key, and it hands off to the
 * device's own map app on a phone.
 */
export function mapsHref(): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    `${SITE.postcode}, United Kingdom`,
  )}`;
}

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
  /* Services is the one entry with a panel. Industries had one too, dropping
     down to nine sector pages; those are now a single editorial page, so
     Markets below is a plain link — there is nothing to list. */
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
  { label: "Markets", href: "/markets" },
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
  { label: "Markets", href: "/markets" },
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
