/**
 * ============================================================================
 *  SITE MARK — the single puzzle piece used for the logo and the cursor
 * ============================================================================
 *
 * Traced directly from the supplied artwork at
 *   public/work/Puzzle logo&images/Logo instructions.png
 * which stays in the repo as the visual source of truth. The PNG itself is
 * fully opaque — its black background is baked in, with no alpha channel — so
 * it cannot be dropped onto the header, footer or cursor without carrying a
 * black box with it. Hence this vector version.
 *
 * Traced by flood-filling the blue body and walking the contour with marching
 * squares: 4,872 boundary points simplified to 134 at a 1.2px tolerance.
 * Silhouette, orientation and proportions are the artwork's, not a redrawing.
 *
 * THIS IS NOT THE LOADER. The intro loader has its own frozen two-piece
 * geometry in ./puzzle-loader-paths.ts and must never be pointed at this file.
 *
 *   site logo + cursor -> THIS FILE
 *   intro loader       -> ./puzzle-loader-paths.ts
 *   decorative marks   -> ./puzzle-paths.ts (hero backdrop, route wipe, 404)
 */

/** Square box; the artwork is normalised to fill it with the keyline included. */
export const SITE_MARK_VIEWBOX = "0 0 1000 1000";

/** Outline of the blue body. Stroke it white, then fill — see SITE_MARK_KEYLINE. */
export const SITE_MARK_PATH =
  "M516.15 47.43 L343.59 220.99 L336.53 224.02 L324.42 223.01 L315.34 215.94 L312.31 208.88 L312.31 200.81 L308.27 187.69 L300.2 171.54 L294.15 163.47 L276.99 147.33 L255.8 136.23 L225.53 130.17 L201.31 132.19 L185.17 137.24 L158.93 153.38 L143.79 169.53 L130.68 193.74 L125.63 214.93 L125.63 236.13 L127.65 247.23 L136.73 269.42 L148.84 286.58 L161.96 298.69 L173.06 305.75 L192.23 313.82 L204.34 314.83 L211.4 317.86 L219.48 327.95 L219.48 341.07 L215.44 349.14 L53.99 509.59 L53.99 511.6 L216.45 673.06 L218.47 677.09 L219.48 691.22 L215.44 699.29 L206.36 705.35 L184.16 710.39 L161.96 723.51 L144.8 740.67 L130.68 765.89 L125.63 787.08 L126.64 814.33 L132.69 834.51 L148.84 859.74 L172.05 878.91 L195.26 889 L211.4 892.03 L233.6 892.03 L248.74 889 L271.95 878.91 L282.04 871.85 L297.17 856.71 L310.29 832.49 L313.32 814.33 L320.38 805.25 L328.46 802.22 L338.55 803.23 L345.61 807.27 L346.62 810.29 L490.92 955.6 L632.19 814.33 L605.95 790.11 L595.86 775.98 L584.76 752.77 L577.7 725.53 L576.69 696.27 L581.74 669.02 L595.86 636.73 L608.98 618.57 L625.13 602.42 L637.24 593.34 L662.46 580.22 L690.72 572.15 L727.04 571.14 L751.26 576.19 L779.52 588.29 L802.72 605.45 L814.83 618.57 L814.83 620.59 L819.88 623.61 L904.64 538.85 L904.64 536.83 L906.66 536.83 L920.79 522.7 L920.79 520.69 L948.03 495.46 L948.03 493.44 L840.06 385.47 L837.03 386.48 L836.02 391.52 L821.9 414.73 L796.67 439.96 L783.55 449.04 L765.39 458.12 L738.14 466.2 L705.85 468.21 L671.54 462.16 L637.24 446.01 L613.02 425.83 L591.83 396.57 L579.72 367.31 L574.67 338.04 L574.67 319.88 L578.71 294.65 L589.81 265.39 L608.98 237.13 L632.19 215.94 L659.43 200.81 L667.51 198.79 L667.51 195.76 L654.39 182.64 L652.37 182.64 L650.35 178.61 L643.29 173.56 L634.21 164.48 L634.21 162.46 L621.09 149.34 L619.07 149.34 L618.06 146.32 L608.98 137.24 L606.96 137.24 L606.96 135.22 L602.93 133.2 L601.92 130.17 L594.85 125.13 L593.84 122.1 L591.83 122.1 L590.82 119.07 L586.78 117.05 L585.77 114.03 L519.17 47.43 L517.15 47.43 Z";

/**
 * White keyline, as a centred stroke width. Half sits outside the contour, so
 * the visible border is 45 units against a body 894 units wide — 5.0%, which is
 * what the source artwork carries (45 of 886, 5.1%).
 */
export const SITE_MARK_KEYLINE = 90;

/** Blue sampled from the artwork (modal value across the filled body). */
export const SITE_MARK_BLUE = "#36b6fe";
