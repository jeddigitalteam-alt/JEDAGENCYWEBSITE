/**
 * Generates public/logo.svg from the canonical two-piece geometry in
 * components/brand/puzzle-paths.ts, so the static file can never drift from
 * the React component. Run via `npm run gen:logo`.
 *
 * THIS SCRIPT DOES NOT WRITE public/icon.svg. It used to, emitting the
 * two-piece mark — which is how the old interlocking logo ended up in the
 * browser tab and in Google's favicon cache. The favicon is the SINGLE piece
 * and is owned entirely by scripts/gen-favicons.mjs. Do not add it back here.
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

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public/logo.svg"), logo);

console.log(
  `wrote public/logo.svg (blue + white keyline)\n` +
    `  piece A: ${A.length} chars\n  piece B: ${B.length} chars`,
);
