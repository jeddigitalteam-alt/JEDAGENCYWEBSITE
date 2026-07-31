/**
 * Generates public/logo.svg and public/icon.svg from the canonical geometry in
 * components/brand/puzzle-paths.ts, so the static files can never drift from
 * the React component. Run via `npm run gen:logo`.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "components/brand/puzzle-paths.ts"), "utf8");

function extract(name) {
  // Matches:  export const NAME =\n  "M... Z";
  const re = new RegExp(`export const ${name} =\\s*"([^"]+)"`, "m");
  const m = src.match(re);
  if (!m) throw new Error(`Could not extract ${name} from puzzle-paths.ts`);
  return m[1];
}

const A = extract("PIECE_A");
const B = extract("PIECE_B");

function num(name) {
  const m = src.match(new RegExp(`export const ${name} = ([0-9.]+)`, "m"));
  if (!m) throw new Error(`Could not extract ${name} from puzzle-paths.ts`);
  return Number(m[1]);
}
function str(name) {
  const m = src.match(new RegExp(`export const ${name} = "([^"]+)"`, "m"));
  if (!m) throw new Error(`Could not extract ${name} from puzzle-paths.ts`);
  return m[1];
}

const BLUE = "#12A8FF";
const KEYLINE_STROKE = num("SEAM_GAP") * 2;
const LOGO_VIEWBOX = str("LOGO_VIEWBOX");

/* The distributable logo — the site logo treatment: solid blue pieces under a
   white keyline. Both pieces are stroked white first and filled blue second, so
   the fill covers the inner half of each stroke and the white reads as an
   outline. Mirrors components/brand/PuzzleSiteLogo.tsx; keep the two in step. */
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}">
  <title>Puzzle</title>
  <g fill="none" stroke="#FFFFFF" stroke-width="${KEYLINE_STROKE}" stroke-linejoin="round" stroke-linecap="round">
    <path d="${A}"/>
    <path d="${B}"/>
  </g>
  <g fill="${BLUE}">
    <path d="${A}"/>
    <path d="${B}"/>
  </g>
</svg>
`;

/* Favicon — solid blue, no keyline. A white outline is worse than useless in a
   browser tab: it vanishes on a light tab strip, and at 16px the halo is under
   half a pixel, so it only muddies the silhouette. */
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" fill="${BLUE}">
  <title>Puzzle</title>
  <path d="${A}"/>
  <path d="${B}"/>
</svg>
`;

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public/logo.svg"), logo);
writeFileSync(join(root, "public/icon.svg"), icon);

console.log(
  `wrote public/logo.svg (blue + white keyline) + public/icon.svg (solid)\n` +
    `  piece A: ${A.length} chars\n  piece B: ${B.length} chars`,
);
