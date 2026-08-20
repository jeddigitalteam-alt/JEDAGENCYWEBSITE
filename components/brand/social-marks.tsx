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

export function FacebookMark(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      {/* The f, drawn as one stroke: down the stem, out to the serif, and the
          crossbar. Same 24-unit grid and same weight as the two above. */}
      <path d="M15.2 8.1h-1.5a1.9 1.9 0 0 0-1.9 1.9v11" />
      <path d="M9.4 13.1h5.2" />
    </svg>
  );
}

/**
 * WhatsApp, as the handset-in-a-speech-bubble.
 *
 * The bubble's tail is the detail that makes it read as WhatsApp rather than as
 * a generic phone, so it is drawn as part of the outline rather than as a
 * separate shape. Stroked from `currentColor` like the others, which is what
 * lets the footer render it in the footer's own ink and the WhatsApp CTA render
 * the same glyph in WhatsApp green.
 */
export function WhatsAppMark(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 20.5l1.3-4.1a8.2 8.2 0 1 1 3.1 3z" />
      <path d="M9.1 8.6c.3-.1.6 0 .8.3l.7 1.2c.1.3.1.6-.1.8l-.5.5a5.6 5.6 0 0 0 2.6 2.6l.5-.5c.2-.2.5-.2.8-.1l1.2.7c.3.2.4.5.3.8a2 2 0 0 1-2.4 1.2 8.1 8.1 0 0 1-5.1-5.1 2 2 0 0 1 1.2-2.4z" />
    </svg>
  );
}

export const SOCIAL_MARKS = {
  Instagram: InstagramMark,
  LinkedIn: LinkedInMark,
  Facebook: FacebookMark,
  WhatsApp: WhatsAppMark,
} as const;

export type SocialLabel = keyof typeof SOCIAL_MARKS;
