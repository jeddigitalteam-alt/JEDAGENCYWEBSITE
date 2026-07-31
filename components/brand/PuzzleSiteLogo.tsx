import {
  KEYLINE_STROKE,
  LOGO_VIEWBOX,
  PIECE_A,
  PIECE_B,
} from "./puzzle-paths";

export interface PuzzleSiteLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Colour of the keyline. White is the brand treatment and is deliberately a
   * literal colour rather than `currentColor` — the keyline has to stay white
   * on the ink background, where `currentColor` is the blue of the fill.
   */
  keyline?: string;
  /**
   * Accessible label. Omit for decorative instances — the mark is then hidden
   * from assistive tech rather than announced twice alongside the "puzzle"
   * wordmark it usually sits next to.
   */
  title?: string;
}

/**
 * The Puzzle SITE LOGO: two solid blue pieces carrying a white keyline.
 *
 * This is the logo, and only the logo. The intro loader draws its own frozen
 * artwork from ./puzzle-loader-paths via ./IntroLoader — changing anything here
 * has no effect on it.
 *
 * How the keyline is drawn, and why this structure:
 *
 * Both pieces are stroked white first, then both are filled blue on top. The
 * fill covers the inner half of every stroke, so a centred stroke of
 * KEYLINE_STROKE reads as a KEYLINE_HALO-thick outline sitting outside the
 * contour. The white is real paint in the artwork, never background showing
 * through, so it survives on ink, on white, and on any photo behind it.
 *
 * Strokes and fills are in two passes rather than per-path `paint-order`
 * because the pieces sit one SEAM_GAP apart, which is exactly how far each
 * halo reaches. With `paint-order` the second piece's stroke is laid down
 * after the first piece's fill and would shave a half-pixel of white off the
 * neighbouring blue edge. Two passes make the order explicit: all white, then
 * all blue.
 *
 * That same reach is what closes the seam. Each halo spans the full gap, so the
 * central tab-and-socket connection is painted white rather than left as a
 * background-coloured slot, and the two pieces stay visually distinct.
 *
 * Colour comes from `currentColor`, so the caller sets it with a text utility
 * (`text-blue`) and the mark works in normal and inverted sections alike.
 */
export function PuzzleSiteLogo({
  keyline = "#ffffff",
  title,
  ...props
}: PuzzleSiteLogoProps) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}

      {/* Pass 1 — the keyline. Round joins so the halo turns the four diamond
          points cleanly instead of throwing long mitre spikes. */}
      <g
        fill="none"
        stroke={keyline}
        strokeWidth={KEYLINE_STROKE}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d={PIECE_A} />
        <path d={PIECE_B} />
      </g>

      {/* Pass 2 — the blue. Covers the inner half of both strokes. */}
      <g fill="currentColor">
        <path d={PIECE_A} />
        <path d={PIECE_B} />
      </g>
    </svg>
  );
}

export default PuzzleSiteLogo;
