import Link from "next/link";
import { SERVICES } from "@/lib/services";

/**
 * The capability lines under each sticker.
 *
 * Keyed by slug and kept short on purpose — three to five words each, no
 * sentences. The service pages carry the argument at length; this is the index
 * of it. A service without an entry here simply renders its name and link, so
 * adding one to `lib/services.ts` cannot break this section.
 */
const CAPABILITIES: Record<string, string[]> = {
  "brand-identity": ["Positioning", "Marks and lockups", "Type and colour", "Guidelines"],
  "web-design-development": [
    "Content strategy",
    "UX architecture",
    "Responsive design",
    "Development",
    "Launch and support",
  ],
  "ux-ui-design": ["User journeys", "Wireframes", "Interface design", "Prototyping", "Design systems"],
  "digital-product-design": ["Product structure", "Flows and job stories", "Prototypes", "Component library"],
  "ai-design": ["Concept exploration", "AI product UX", "Interaction models", "Evaluation surfaces"],
  retainer: ["Ongoing design", "Any discipline", "Shared board", "Quarterly review"],
};

/**
 * Sticker artwork.
 *
 * Six original drawings, one concept each, sharing a family: an off-white body
 * cut to a slightly irregular silhouette, a light-blue keyline around it, and
 * simple blue line-art inside. The silhouettes are deliberately *not* the same
 * path six times — each is cut a little differently, the way a sheet of real
 * stickers would be, which is what stops a row of them reading as six icons in
 * six identical circles.
 *
 * Inline SVG rather than image files: six of these as PNGs would be six network
 * requests and a fixed resolution, for artwork that is a few hundred bytes of
 * path data and stays sharp at any size. Colours come from the token layer, so
 * the whole family inverts with the section around it.
 */
type StickerProps = { className?: string };

/** Shared drawing attributes, so every icon has the same weight of line. */
const LINE = {
  stroke: "var(--blue)",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function Sticker({
  body,
  children,
  className = "",
}: {
  /** The cut edge of this particular sticker. */
  body: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={body}
        fill="var(--paper)"
        stroke="var(--blue-lift)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {children}
    </svg>
  );
}

/** Brand identity — separate geometric pieces assembling into one mark. */
function BrandSticker({ className }: StickerProps) {
  return (
    <Sticker
      className={className}
      body="M13 31 C12 18 23 8 36 10 C49 12 62 6 73 13 C85 20 90 33 86 46 C83 57 90 69 81 78 C72 86 57 87 45 86 C32 85 19 84 13 74 C7 65 10 53 12 43 Z"
    >
      <circle cx="38" cy="38" r="13" {...LINE} />
      <path d="M52 30 L74 30 L74 52 Z" {...LINE} />
      <rect x="30" y="58" width="20" height="20" rx="4" {...LINE} />
      <path d="M58 60 L58 78 M66 60 L66 78 M74 60 L74 78" {...LINE} />
    </Sticker>
  );
}

/** Web design and development — a browser frame meeting a code grid. */
function WebSticker({ className }: StickerProps) {
  return (
    <Sticker
      className={className}
      body="M10 26 C11 15 21 8 33 10 C46 12 60 7 71 14 C83 21 88 34 85 47 C82 58 88 70 78 78 C68 86 54 88 42 86 C29 84 17 82 12 72 C7 62 9 50 10 40 Z"
    >
      <rect x="22" y="24" width="52" height="40" rx="6" {...LINE} />
      <path d="M22 36 L74 36" {...LINE} />
      <circle cx="30" cy="30" r="2" fill="var(--blue)" />
      <circle cx="38" cy="30" r="2" fill="var(--blue)" />
      <path d="M40 46 L34 52 L40 58" {...LINE} />
      <path d="M56 46 L62 52 L56 58" {...LINE} />
      <path d="M50 44 L46 60" {...LINE} />
      <path d="M34 74 L62 74" {...LINE} />
    </Sticker>
  );
}

/** UX and UI — two screens joined by a curved interaction path. */
function UxSticker({ className }: StickerProps) {
  return (
    <Sticker
      className={className}
      body="M15 24 C14 13 25 7 37 9 C50 11 63 8 74 15 C86 23 89 37 84 49 C80 59 88 72 78 80 C68 88 53 88 41 86 C28 84 16 81 12 71 C8 60 12 48 14 38 Z"
    >
      <rect x="19" y="24" width="26" height="34" rx="5" {...LINE} />
      <path d="M25 33 L39 33 M25 41 L35 41" {...LINE} />
      <rect x="53" y="42" width="26" height="34" rx="5" {...LINE} />
      <path d="M59 51 L73 51 M59 59 L69 59" {...LINE} />
      {/* the interaction path between them */}
      <path d="M45 40 C56 40 52 30 66 34" {...LINE} strokeDasharray="4 5" />
      <circle cx="66" cy="34" r="3.5" fill="var(--blue)" />
    </Sticker>
  );
}

/** Digital product design — a module snapping into a larger frame. */
function ProductSticker({ className }: StickerProps) {
  return (
    <Sticker
      className={className}
      body="M12 28 C12 16 22 9 34 10 L66 12 C79 12 89 22 88 35 C87 47 91 60 83 70 C75 80 61 86 48 86 C35 86 20 84 14 74 C8 64 10 51 11 41 Z"
    >
      <rect x="20" y="22" width="54" height="50" rx="7" {...LINE} />
      <path d="M20 40 L46 40 M46 22 L46 72" {...LINE} strokeDasharray="4 5" />
      <rect x="50" y="26" width="20" height="10" rx="3" fill="var(--blue)" />
      <path d="M26 50 L38 50 M26 58 L34 58" {...LINE} />
      <path d="M54 48 L60 54 L70 44" {...LINE} />
    </Sticker>
  );
}

/** AI design — a constellation of nodes resolving into a mesh. */
function AiSticker({ className }: StickerProps) {
  return (
    <Sticker
      className={className}
      body="M9 30 C8 17 20 8 33 11 C47 14 61 5 72 12 C84 19 91 32 87 45 C84 56 91 70 80 78 C69 87 53 89 40 87 C27 85 15 83 10 73 C5 63 8 51 9 41 Z"
    >
      <path
        d="M28 62 L34 34 L54 26 L70 44 L60 68 Z"
        {...LINE}
        strokeDasharray="3 6"
      />
      <path d="M34 34 L60 68 M54 26 L28 62 M70 44 L34 34" {...LINE} />
      <circle cx="34" cy="34" r="4" fill="var(--blue)" />
      <circle cx="54" cy="26" r="4" fill="var(--blue)" />
      <circle cx="70" cy="44" r="4" fill="var(--blue)" />
      <circle cx="60" cy="68" r="4" fill="var(--blue)" />
      <circle cx="28" cy="62" r="4" fill="var(--blue)" />
    </Sticker>
  );
}

/** Retainer — a continuous orbit, with the work carried round it. */
function RetainerSticker({ className }: StickerProps) {
  return (
    <Sticker
      className={className}
      body="M14 33 C13 20 24 9 38 10 C51 11 65 8 75 16 C86 24 89 38 85 50 C81 61 87 71 78 79 C69 87 55 88 43 86 C31 84 18 83 13 73 L12 55 Z"
    >
      <ellipse cx="48" cy="48" rx="30" ry="18" {...LINE} />
      <ellipse
        cx="48"
        cy="48"
        rx="30"
        ry="18"
        {...LINE}
        transform="rotate(60 48 48)"
      />
      <circle cx="48" cy="48" r="7" fill="var(--blue)" />
      <circle cx="76" cy="42" r="4.5" fill="var(--blue-lift)" stroke="var(--blue)" strokeWidth={2} />
      <circle cx="26" cy="60" r="3.5" fill="var(--blue-lift)" stroke="var(--blue)" strokeWidth={2} />
    </Sticker>
  );
}

const ART: Record<string, (p: StickerProps) => React.ReactElement> = {
  "brand-identity": BrandSticker,
  "web-design-development": WebSticker,
  "ux-ui-design": UxSticker,
  "digital-product-design": ProductSticker,
  "ai-design": AiSticker,
  retainer: RetainerSticker,
};

/**
 * What we do, as a row of stickers.
 *
 * Driven by `SERVICES`, so it is always the live list — a service removed from
 * the data disappears from here, and there is no second copy of the names to
 * fall out of step. Six across at `xl`, three at `md`, two on a phone: a
 * horizontal scroller was the alternative, but a two-column grid keeps the
 * artwork at a usable size on a small screen, which a six-item rail cannot.
 */
export function ServiceStickers() {
  return (
    <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 md:mt-20 md:grid-cols-3 md:gap-x-8 xl:grid-cols-6">
      {SERVICES.map((service) => {
        const Art = ART[service.slug];
        const lines = CAPABILITIES[service.slug] ?? [];
        return (
          <li key={service.slug}>
            <Link
              href={`/services/${service.slug}`}
              className="group block rounded-xl focus-visible:outline-offset-4"
            >
              {Art ? (
                /* Lifts a little on hover, and not at all under reduced
                   motion — the same restraint the work tiles use. */
                <Art className="w-20 transition-transform duration-500 ease-out group-hover:-translate-y-1.5 motion-reduce:transform-none md:w-24" />
              ) : null}
              <h3 className="display mt-6 text-step-1 transition-colors group-hover:text-blue">
                {service.name}
              </h3>
            </Link>
            <ul className="mt-4 grid gap-1.5">
              {lines.map((line) => (
                <li key={line} className="text-step--1 text-content-dim">
                  {line}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

export default ServiceStickers;
