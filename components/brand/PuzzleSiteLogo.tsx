import {
  SITE_MARK_BLUE,
  SITE_MARK_KEYLINE,
  SITE_MARK_PATH,
  SITE_MARK_VIEWBOX,
} from "./puzzle-site-mark";

export interface PuzzleSiteLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Colour of the keyline. White is the brand treatment and is deliberately a
   * literal colour rather than `currentColor` — the keyline has to stay white
   * against the ink background, where `currentColor` is the blue of the body.
   */
  keyline?: string;
  /**
   * Accessible label. Omit for decorative instances — the mark is then hidden
   * from assistive tech rather than announced twice alongside the "puzzle"
   * wordmark it sits next to.
   */
  title?: string;
}

/**
 * The Puzzle SITE LOGO: the single piece, blue body under a white keyline.
 *
 * One component owns the mark for both the header and the footer, so the two
 * can never drift apart. Geometry comes from ./puzzle-site-mark, traced from
 * the supplied artwork.
 *
 * NOT the loader. The intro loader draws its own frozen two-piece artwork from
 * ./puzzle-loader-paths via ./IntroLoader; changing anything here has no effect
 * on it.
 *
 * The keyline is a centred stroke drawn under the fill via `paint-order`, so
 * its inner half is covered and it reads as an outline sitting outside the
 * contour. One path means one shape, so there is no second piece whose stroke
 * could shave the neighbouring fill — this is a single stroke-then-fill.
 *
 * The blue is fixed to the artwork's own value rather than `currentColor`: the
 * brief was that the mark match the supplied file exactly.
 */
export function PuzzleSiteLogo({
  keyline = "#ffffff",
  title,
  ...props
}: PuzzleSiteLogoProps) {
  return (
    <svg
      viewBox={SITE_MARK_VIEWBOX}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d={SITE_MARK_PATH}
        fill={SITE_MARK_BLUE}
        stroke={keyline}
        strokeWidth={SITE_MARK_KEYLINE}
        strokeLinejoin="round"
        strokeLinecap="round"
        paintOrder="stroke"
      />
    </svg>
  );
}

export default PuzzleSiteLogo;
