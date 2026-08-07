export interface Industry {
  slug: string;
  name: string;
  summary: string;
  intro: string;
  /** What we've learned working here. Specific, not flattering. */
  notes: string[];
  /**
   * Optional. Where a sector needs it spelled out, the shared industry page
   * renders these two extra sections; sectors that omit them are unchanged.
   */
  capabilities?: string[];
  audience?: string[];
  /**
   * Optional full-bleed hero artwork. The page heading sits on top of it.
   *
   * All three that exist are 1254x1254. The hero frame is a wide banner, so
   * `cover` scales each plate to the frame's width and shows a horizontal band
   * of roughly half its height — which is why `imagePosition` below is set per
   * sector rather than left centred.
   *
   * Sectors without one render exactly as they did before: a plain padded
   * hero, no image, no empty frame.
   *
   * Files live under `/industries/` rather than in the folder they arrived in.
   * That folder has a literal `&` in its name, and while it happens to serve in
   * dev, the same trap already bit the service card artwork — see the note in
   * ServicesPanels. Copies with plain lowercase names are the house pattern.
   */
  image?: string;
  imageAlt?: string;
  /**
   * `object-position` for the full-bleed hero.
   *
   * Needed per sector rather than centred blindly. The frame is a wide banner
   * and every source is 1:1, so `cover` fits to width and crops the height —
   * on a 16:6-ish desktop hero that keeps roughly the middle 40% of the
   * picture, and the three plates put their subject in three different places
   * within that. The horizontal half only comes into play on a phone, where
   * the frame is taller than it is wide and the crop swaps axis.
   */
  imagePosition?: string;
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "ai",
    name: "AI",
    summary: "Interfaces for systems that are probabilistic, not certain.",
    intro:
      "We have designed for models that stream, stall, hedge and occasionally invent. The interface has to be honest about which is happening.",
    notes: [
      "Confidence is a design problem before it is a model problem.",
      "Streaming changes layout expectations — reserve the space.",
      "Every AI feature needs a correction path, not just a thumbs-down.",
    ],
    image: "/industries/ai.png",
    imageAlt:
      "An AI assistant interface on a dark stage — a confidence reading, a workflow panel and a lit glass block carrying a brain motif",
    /* The lit glass block is the subject and sits low and centre; the plate
       carries its own headline across the top third. The hero frame is far
       wider than the 1:1 source, so `cover` shows a horizontal band of about
       half its height, and this picks which. 78% starts that band below the
       artwork's own headline and lands the glass block, the automation panel
       and the insight dial inside it. */
    imagePosition: "center 78%",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    summary: "Product pages that answer the question before it is asked.",
    intro:
      "Conversion work is mostly removing doubt: fit, delivery, returns, whether the colour is really that colour.",
    notes: [
      "Photography carries more weight than layout. Budget for it.",
      "The size guide is a conversion surface, not a footer link.",
      "Fast filtering beats clever filtering.",
    ],
    image: "/industries/ecommerce.png",
    imageAlt:
      "A dark storefront design shown on a laptop and a phone — a product hero, a featured row and a checkout sheet",
    /* Lower than the laptop's product hero on purpose. That part of the plate
       carries the mockup's own headline, and a band starting below it gets the
       featured product row, the phone's checkout sheet and the carrier bag —
       three things that read as commerce — without a second headline. Right of
       centre keeps the phone in frame when the crop narrows. */
    imagePosition: "56% 84%",
  },
  {
    slug: "fintech",
    name: "Fintech",
    summary: "Clarity under regulatory constraint.",
    intro:
      "Financial interfaces are read carefully by people who are slightly anxious. Precision in numbers, tone and hierarchy does more than reassurance copy.",
    notes: [
      "Tabular figures everywhere. Misaligned digits read as sloppy.",
      "Show the fee before the confirm step, not after.",
      "Compliance copy can be clear. It is usually just unedited.",
    ],
    image: "/industries/fintech.png",
    imageAlt:
      "A banking app on a phone beside a matte payment card — balance, a performance chart and a list of accounts",
    /* The phone runs almost the full height, so a band low enough to clear the
       plate's own headline still holds the balance, the chart and the account
       list — the part that reads as a financial interface. Right of centre
       keeps the phone and the card together when the crop narrows on a
       phone. */
    imagePosition: "58% 84%",
  },
  {
    slug: "machinery",
    name: "Machinery",
    summary: "Digital work built for serious machinery businesses.",
    intro:
      "Brands, websites and digital tools for plant, machinery and equipment companies. The work is turning technical detail into something a buyer can act on — credibly, and without having to phone first.",
    notes: [
      "Stock changes daily. A catalogue nobody can update stops being true within a week.",
      "Buyers compare on specification. Put the numbers where they can be scanned, not inside a PDF.",
      "Most enquiries start on a phone, outdoors, on bad signal. That is the design target.",
    ],
    capabilities: [
      "Brand identity",
      "Website design and development",
      "Stock and catalogue sites",
      "Product and equipment pages",
      "Enquiry and lead-generation journeys",
      "Dealer and distributor platforms",
      "Search and filtering",
      "Photography and motion",
      "Ongoing digital support",
    ],
    audience: [
      "Plant and machinery dealers",
      "Forklift and materials handling",
      "Equipment rental",
      "Agricultural machinery",
      "Heavy lifting and logistics",
      "Industrial manufacturers",
      "Parts and service businesses",
      "Specialist engineering",
    ],
  },
  {
    slug: "sports",
    name: "Sports",
    summary: "Performance brands that have to look like they perform.",
    intro:
      "Sports work lives or dies on photography and pace. The layout's job is to get out of the way of both.",
    notes: [
      "Drops need a countdown that is honest about stock.",
      "Motion should feel like the sport, not like a website.",
      "Kit colourways deserve their own labelling system.",
    ],
  },
  {
    slug: "saas",
    name: "SaaS",
    summary: "Marketing sites that survive contact with the product team.",
    intro:
      "A SaaS site is a system, not a page. If adding a feature means redesigning the homepage, the system was wrong.",
    notes: [
      "Design the pricing table first. It constrains everything.",
      "Screenshots go stale. Build them from components where you can.",
      "Docs are part of the brand. Most teams forget this.",
    ],
  },
  {
    slug: "b2b",
    name: "B2B",
    summary: "Long sales cycles, many readers, one site.",
    intro:
      "Several people with different questions read the same page. Structure matters more than persuasion.",
    notes: [
      "The procurement reader needs different pages than the champion.",
      "Case studies with numbers outperform case studies with adjectives.",
      "A good PDF export is worth more than an animation.",
    ],
  },
];

export function getIndustry(slug: string) {
  return INDUSTRIES.find((i) => i.slug === slug);
}
