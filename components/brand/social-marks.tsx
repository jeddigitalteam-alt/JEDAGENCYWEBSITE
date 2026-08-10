import type { SVGProps } from "react";

/**
 * The two social marks, as paths.
 *
 * No icon package is installed — `geist` is the typeface, not its icon set —
 * and pulling one in for two glyphs would ship a dependency, its tree-shaking
 * config and its own sizing conventions to draw 48 bytes of path data. These
 * are the official marks, drawn on the same 24-unit grid, stroked from
 * `currentColor` so they inherit the footer's token layer exactly as the type
 * around them does.
 *
 * Decorative by default: every use is inside a link that carries the name, so
 * announcing the glyph as well would say "Instagram Instagram".
 */
type MarkProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
} as const;

export function InstagramMark(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      {/* The flash. A dot at this size, so it is drawn as a short stroke
          rather than a filled circle that would render as a smudge. */}
      <path d="M17.4 6.6h.01" />
    </svg>
  );
}

export function LinkedInMark(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.2 10.4v6.4" />
      <path d="M7.2 7.4h.01" />
      <path d="M11.4 16.8v-6.4" />
      <path d="M11.4 13.2a2.8 2.8 0 0 1 5.6 0v3.6" />
    </svg>
  );
}

export const SOCIAL_MARKS = {
  Instagram: InstagramMark,
  LinkedIn: LinkedInMark,
} as const;

export type SocialLabel = keyof typeof SOCIAL_MARKS;
