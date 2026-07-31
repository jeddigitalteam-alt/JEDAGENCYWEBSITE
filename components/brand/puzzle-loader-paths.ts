/**
 * ============================================================================
 *  LOADER ARTWORK LOCKED — DO NOT MODIFY WHEN EDITING THE SITE LOGO
 * ============================================================================
 *
 * This file is the intro loader's artwork and nothing else. It is a frozen
 * copy of the mark geometry as it stood at commit f9b998f, immediately before
 * the site logo was rebuilt from the corrected artwork.
 *
 * It is deliberately duplicated rather than imported from ./puzzle-paths so
 * that the site logo and the loader cannot drift into each other. Editing the
 * site logo must have ZERO visual effect on the loader.
 *
 *   site logo  → ./puzzle-paths.ts + ./PuzzleSiteLogo.tsx
 *   loader     → THIS FILE        + ./IntroLoader.tsx
 *
 * The two pieces here are LOCKED: they share their seam boundary and touch
 * edge to edge, which is what the loader's lock animation lands on. Piece A's
 * edge runs (343.5,343.6) → (462.0,462.1) → (657.1,655.9) and piece B's runs
 * (342.3,344.1) → (655.3,656.4) → (553.8,554.9). The resting state is the path
 * data exactly as written — knob seated in socket, no gap anywhere along the
 * seam.
 *
 * Do not change the shape, the stroke, the animation, the timing, the
 * positioning, or how the pieces connect.
 */

export const LOADER_VIEWBOX = "0 0 1000 1000";

/** piece A — top-right. Frozen. */
export const LOADER_PIECE_A =
  "M655.8 30.0 L548.5 137.3 L578.8 159.4 L590.4 172.5 L598.6 187.4 L602.8 202.0 L603.8 222.7 L601.5 235.6 L595.2 250.9 L584.5 266.0 L573.8 275.8 L556.3 285.6 L537.5 290.4 L521.0 290.4 L502.7 286.0 L487.1 278.0 L470.3 262.7 L451.1 234.5 L343.5 343.6 L462.0 462.1 L443.4 464.7 L422.9 473.5 L405.0 489.2 L394.0 506.9 L388.3 528.3 L388.3 543.0 L390.5 556.4 L398.5 575.2 L414.3 593.9 L436.5 606.8 L457.3 611.2 L480.8 609.1 L499.0 601.8 L512.5 592.0 L527.2 573.9 L534.0 557.9 L537.6 537.5 L657.1 655.9 L769.7 543.3 L773.1 556.1 L783.8 575.3 L799.2 590.0 L820.3 600.6 L835.3 603.6 L850.3 603.6 L862.5 601.3 L881.1 593.4 L899.7 577.7 L911.3 558.9 L916.5 540.4 L916.5 519.0 L911.4 500.7 L901.3 483.5 L888.3 470.4 L873.7 461.7 L856.6 456.3 L969.4 342.9 L857.4 231.0 L838.8 265.0 L824.5 280.8 L804.3 293.1 L780.4 298.4 L761.6 296.9 L742.2 290.1 L727.4 280.1 L715.6 267.3 L705.3 247.8 L701.5 230.9 L701.9 211.1 L706.7 194.6 L716.9 177.1 L730.3 163.7 L768.0 141.5 Z";

/** piece B — bottom-left. Frozen. */
export const LOADER_PIECE_B =
  "M342.3 344.1 L229.9 456.8 L223.1 437.9 L213.3 422.9 L195.5 407.2 L174.9 398.4 L150.9 396.3 L134.3 399.3 L115.7 407.9 L100.0 421.5 L90.9 434.3 L83.1 454.9 L81.6 473.6 L86.5 497.4 L94.8 513.2 L110.4 529.5 L126.6 539.1 L142.3 544.3 L30.0 657.7 L141.9 769.5 L128.0 774.3 L111.1 783.8 L94.8 800.8 L85.9 817.9 L81.6 838.7 L83.1 858.4 L89.4 876.6 L94.9 886.1 L106.3 898.8 L119.6 908.5 L139.9 916.2 L152.2 917.7 L167.3 917.0 L182.8 912.8 L204.3 900.2 L216.4 887.3 L225.5 870.5 L229.8 857.2 L343.0 970.0 L450.3 862.6 L420.5 841.0 L409.3 828.9 L401.2 815.1 L396.0 798.4 L395.0 777.4 L397.8 762.3 L404.0 748.1 L413.7 734.5 L425.6 723.6 L443.5 713.9 L461.7 709.6 L478.8 709.6 L497.6 714.4 L513.4 723.1 L525.3 733.5 L548.0 765.1 L655.3 656.4 L553.8 554.9 L537.0 554.9 L525.1 578.7 L510.9 594.4 L499.9 602.2 L480.0 610.1 L469.0 611.9 L447.3 610.6 L431.9 605.6 L413.7 593.9 L401.7 580.9 L391.4 561.4 L387.5 542.4 L388.5 523.7 L393.7 506.5 L403.3 490.8 L418.3 476.2 L454.9 455.9 Z";

export const LOADER_PIECES = [LOADER_PIECE_A, LOADER_PIECE_B] as const;

/**
 * The seam runs down-right at ~45°, direction ≈ (1,1)/√2, so the normal is
 * (1,-1)/√2 — piece A separates up-right, piece B down-left.
 *
 * Held here rather than imported so that retuning the site-wide seam angle
 * cannot move the loader.
 */
export const LOADER_SEAM_ANGLE_DEG = 45;

/** Separation along the normal, in viewBox units, before the lock. */
export const LOADER_LOCK_OFFSET = 90;

/** Per-axis component of LOADER_LOCK_OFFSET (90 / √2). */
export const LOADER_LOCK_OFFSET_AXIS = Number(
  (LOADER_LOCK_OFFSET / Math.SQRT2).toFixed(2),
);

/** Pre-lock offsets, in viewBox units. Both animate to `transform: none`. */
export const LOADER_PIECE_OFFSETS = [
  { x: LOADER_LOCK_OFFSET_AXIS, y: -LOADER_LOCK_OFFSET_AXIS }, // A — up-right
  { x: -LOADER_LOCK_OFFSET_AXIS, y: LOADER_LOCK_OFFSET_AXIS }, // B — down-left
] as const;
