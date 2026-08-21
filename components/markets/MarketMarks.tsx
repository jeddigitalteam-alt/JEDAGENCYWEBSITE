/**
 * Five market marks.
 *
 * Related to the About page's service stickers — same off-white body, same
 * light-blue keyline, same blue linework — but drawn on a different idea, so
 * they read as a sibling family rather than a reused set. The service icons
 * describe a discipline; these describe a *relationship*: who is on each side
 * of the transaction, and what has to travel between them.
 *
 * Inline SVG, a few hundred bytes of path data each, coloured from the token
 * layer so they invert with whatever section they land in.
 */
type MarkProps = { className?: string };

const LINE = {
  stroke: "var(--blue)",
  strokeWidth: 2.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

function Body({
  d,
  children,
  className = "",
}: {
  d: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true" focusable="false">
      <path
        d={d}
        fill="var(--paper)"
        stroke="var(--blue-lift)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {children}
    </svg>
  );
}

/** B2B — two systems meeting, with something passing between them. */
export function B2BMark({ className }: MarkProps) {
  return (
    <Body
      className={className}
      d="M13 29 C12 17 22 8 34 10 C47 12 61 7 71 14 C83 22 88 34 85 46 C82 57 89 69 79 77 C69 86 55 88 43 86 C30 84 18 82 12 72 C6 62 10 50 12 40 Z"
    >
      <rect x="18" y="34" width="24" height="30" rx="4" {...LINE} />
      <rect x="54" y="34" width="24" height="30" rx="4" {...LINE} />
      <path d="M24 42h12M24 50h8" {...LINE} strokeWidth={2} />
      <path d="M60 42h12M60 50h8" {...LINE} strokeWidth={2} />
      {/* the handshake: one line out, one line back */}
      <path d="M42 45h12" {...LINE} />
      <path d="M54 53H42" {...LINE} strokeDasharray="3 5" />
      <circle cx="48" cy="45" r="2.6" fill="var(--blue)" />
    </Body>
  );
}

/** B2C — one business, many individuals. */
export function B2CMark({ className }: MarkProps) {
  return (
    <Body
      className={className}
      d="M11 27 C11 16 21 8 33 10 C46 12 59 6 70 13 C82 20 89 33 86 45 C83 56 90 70 80 78 C70 87 55 88 42 86 C29 84 17 83 11 73 C5 63 9 49 11 38 Z"
    >
      <rect x="20" y="26" width="22" height="26" rx="4" {...LINE} />
      <path d="M26 34h10" {...LINE} strokeWidth={2} />
      {/* three people, fanning out from it */}
      <circle cx="62" cy="30" r="5" {...LINE} />
      <path d="M55 42c1.5-4 12.5-4 14 0" {...LINE} />
      <circle cx="70" cy="52" r="5" fill="var(--blue)" />
      <path d="M63 64c1.5-4 12.5-4 14 0" {...LINE} />
      <circle cx="55" cy="70" r="4" {...LINE} />
      <path d="M42 38h8M42 48h14M42 60h6" {...LINE} strokeDasharray="3 5" />
    </Body>
  );
}

/** E-commerce — a product travelling a path and arriving. */
export function EcomMark({ className }: MarkProps) {
  return (
    <Body
      className={className}
      d="M14 25 C13 14 24 7 36 9 C49 11 62 8 73 16 C85 24 88 38 83 50 C79 60 87 73 77 81 C67 88 52 88 40 86 C27 84 15 80 11 70 C7 59 12 46 14 36 Z"
    >
      {/* the basket */}
      <path d="M24 40h34l-4 26H28Z" {...LINE} />
      <path d="M34 40a8 8 0 0 1 16 0" {...LINE} />
      {/* the path it came along */}
      <path d="M20 30c10-10 24-12 34-6" {...LINE} strokeDasharray="3 6" />
      <circle cx="66" cy="26" r="6" fill="var(--blue)" />
      <path d="M36 54h12" {...LINE} strokeWidth={2} />
    </Body>
  );
}

/** Hospitality — an arch you walk through, and a place pin. */
export function HospitalityMark({ className }: MarkProps) {
  return (
    <Body
      className={className}
      d="M12 30 C11 18 22 8 35 10 C48 12 60 6 71 13 C84 21 89 35 85 47 C81 58 88 70 78 79 C68 87 54 88 42 86 C29 84 17 81 12 71 C7 61 10 48 12 38 Z"
    >
      {/* the doorway */}
      <path d="M30 72V44a18 18 0 0 1 36 0v28" {...LINE} />
      <path d="M30 72h36" {...LINE} />
      <path d="M48 72V58" {...LINE} />
      {/* the pin above it */}
      <path d="M48 18c5 0 9 4 9 9 0 6-9 13-9 13s-9-7-9-13c0-5 4-9 9-9Z" {...LINE} />
      <circle cx="48" cy="27" r="3" fill="var(--blue)" />
    </Body>
  );
}

/** Startups — something assembling, and climbing. */
export function StartupMark({ className }: MarkProps) {
  return (
    <Body
      className={className}
      d="M10 28 C10 16 21 7 34 10 C47 13 60 5 71 12 C84 20 90 33 86 46 C83 57 90 71 79 79 C68 87 53 89 41 87 C28 85 16 82 10 72 C4 62 8 48 10 38 Z"
    >
      {/* three risers */}
      <rect x="20" y="58" width="14" height="18" rx="3" {...LINE} />
      <rect x="41" y="46" width="14" height="30" rx="3" {...LINE} />
      <rect x="62" y="32" width="14" height="44" rx="3" fill="var(--blue)" stroke="var(--blue)" strokeWidth={2.6} />
      {/* the trajectory over them */}
      <path d="M22 44 L44 34 L70 20" {...LINE} strokeDasharray="4 5" />
      <path d="M62 18h10v10" {...LINE} />
    </Body>
  );
}

export const MARKET_MARKS = {
  b2b: B2BMark,
  b2c: B2CMark,
  ecommerce: EcomMark,
  hospitality: HospitalityMark,
  startups: StartupMark,
} as const;
