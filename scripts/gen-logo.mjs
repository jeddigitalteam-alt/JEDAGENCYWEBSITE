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
const BLUE = "#12A8FF";

// Outline logo — stroke only, no fill, no background square, no wordmark.
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" fill="none" stroke="${BLUE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
  <title>Puzzle</title>
  <path d="${A}"/>
  <path d="${B}"/>
</svg>
`;

// Favicon — solid, heavier presence at 16px where a 7-unit stroke disappears.
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
  `wrote public/logo.svg (outline) + public/icon.svg (solid)\n` +
    `  piece A: ${A.length} chars\n  piece B: ${B.length} chars`,
);
