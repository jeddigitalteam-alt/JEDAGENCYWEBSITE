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
