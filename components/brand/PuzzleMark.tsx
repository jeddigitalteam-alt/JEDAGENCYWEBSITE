import { PIECE_A, PIECE_B, VIEWBOX } from "./puzzle-paths";

type Variant = "outline" | "solid";

export interface PuzzleMarkProps extends React.SVGProps<SVGSVGElement> {
  /**
   * `outline` — stroke-only, no fill. Used by the loader and the 404 piece.
   * `solid`   — filled with currentColor. Used by the header lockup + favicon.
   */
  variant?: Variant;
  /** Stroke width in viewBox units. Only meaningful for `outline`. */
  strokeWidth?: number;
  /**
   * Accessible label. Omit for decorative instances — the mark is then
   * hidden from assistive tech rather than announced twice alongside the
   * "puzzle" wordmark it usually sits next to.
   */
  title?: string;
}

/**
 * The Puzzle mark: two interlocking pieces on a diagonal seam.
 *
 * Geometry comes from ./puzzle-paths — never inline path data at a call site.
 * Colour is inherited via `currentColor`, so the caller controls it with a
 * text colour utility (`text-blue`) and the mark works in both light and
 * inverted sections without a variant for each.
 */
export function PuzzleMark({
  variant = "solid",
  strokeWidth = 7,
  title,
  ...props
}: PuzzleMarkProps) {
  const isOutline = variant === "outline";

  return (
    <svg
      viewBox={VIEWBOX}
      // Outline: no fill anywhere — no background square, no filled pieces.
      fill={isOutline ? "none" : "currentColor"}
      stroke={isOutline ? "currentColor" : "none"}
      strokeWidth={isOutline ? strokeWidth : undefined}
      strokeLinecap={isOutline ? "round" : undefined}
      strokeLinejoin={isOutline ? "round" : undefined}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d={PIECE_A} />
      <path d={PIECE_B} />
    </svg>
  );
}

export default PuzzleMark;
