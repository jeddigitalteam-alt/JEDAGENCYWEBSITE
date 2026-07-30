/**
 * Generates app/gilroy.css from whatever Gilroy webfont files are actually
 * present in public/fonts/gilroy/.
 *
 * Why generate it: Gilroy is commercial and isn't in the repo. A hand-written
 * @font-face with a url() pointing at a missing file costs a 404 on every
 * route, which trips the "no console errors" floor. So url() sources are only
 * emitted for files that exist; otherwise the rule carries local() alone, which
 * makes no network request and simply falls through to the fallback stack.
 *
 * Dropping the licensed woff2 files into public/fonts/gilroy/ and rebuilding is
 * all that's needed — no code change.
 *
 * Wired to prebuild and predev. Also runnable directly: npm run gen:gilroy
 */
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fontDir = join(root, "public/fonts/gilroy");

/** weight → [file, local() aliases] */
const FACES = [
  [400, "Gilroy-Regular.woff2", ["Gilroy Regular", "Gilroy-Regular", "Gilroy"]],
  [700, "Gilroy-Bold.woff2", ["Gilroy Bold", "Gilroy-Bold"]],
];

const found = [];
const missing = [];

const rules = FACES.map(([weight, file, locals]) => {
  const present = existsSync(join(fontDir, file));
  (present ? found : missing).push(file);

  const sources = [
    ...locals.map((l) => `    local("${l}")`),
    ...(present ? [`    url("/fonts/gilroy/${file}") format("woff2")`] : []),
  ].join(",\n");

  return `@font-face {
  font-family: "Gilroy";
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src:
${sources};
}`;
}).join("\n\n");

const header = `/* GENERATED FILE — do not edit by hand.
 * Written by scripts/gen-gilroy-css.mjs on prebuild/predev.
 *
 * Present:  ${found.length ? found.join(", ") : "none"}
 * Missing:  ${missing.length ? missing.join(", ") : "none"}
 *
 * ${
   missing.length
     ? "Missing files carry local() only — no url(), so no 404. The wordmark\n * falls back to Geist until they are added. See public/fonts/gilroy/README.md."
     : "All faces self-hosted."
 }
 */`;

mkdirSync(fontDir, { recursive: true });
writeFileSync(join(root, "app/gilroy.css"), `${header}\n\n${rules}\n`);

console.log(
  `gilroy.css written — ${found.length} self-hosted, ${missing.length} falling back` +
    (missing.length ? ` (${missing.join(", ")})` : ""),
);
