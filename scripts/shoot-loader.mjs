/**
 * Dev-only: captures the intro loader at fixed points in its sequence so the
 * outline, the lock and the reveal can be verified. Also asserts the things
 * that are easy to get silently wrong (fill, background square, seam gap) and
 * collects console errors. Output is gitignored.
 *
 * Two things this has to get right or the frames are meaningless:
 *  - warm the route first, so Turbopack's first-compile cost isn't counted;
 *  - use a FRESH context per run, because the intro is once-per-session and a
 *    reused sessionStorage silently skips it.
 *
 * Usage: node scripts/shoot-loader.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:3000";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".preview");
mkdirSync(out, { recursive: true });

/** ms after the loader mounts → filename */
const FRAMES = [
  [380, "01-drawing"],
  [1080, "02-drawn-apart"],
  [1400, "03-locking"],
  [1720, "04-locked"], // inside the hold, before the fade begins
  [2050, "05-clearing"],
  [2750, "06-hero"],
];

const browser = await chromium.launch();
const errors = [];

/* --- 1. warm the route so first-compile isn't inside the measurement --- */
{
  const warm = await browser.newContext();
  const p = await warm.newPage();
  await p.goto(base, { waitUntil: "load" });
  await p.waitForTimeout(3500);
  await warm.close();
  console.log("route warmed");
}

/* --- 2. fresh context = fresh sessionStorage = intro actually runs ------ */
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(base, { waitUntil: "commit" });
// Anchor t0 to the loader existing, not to navigation.
await page.waitForSelector('svg[aria-label="Puzzle"]', { timeout: 15000 });
const t0 = Date.now();
console.log("loader mounted — capturing");

/* Audited mid-sequence: after the run the loader is unmounted and every
   query returns empty, which reads as a pass when it is really a no-op. */
const audits = {};

for (const [at, name] of FRAMES) {
  const wait = at - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: join(out, `loader-${name}.png`) });
  console.log(`  ${name} @ ~${Date.now() - t0}ms`);
  if (name === "02-drawn-apart" || name === "04-locked") {
    audits[name] = await page.evaluate(auditMark);
  }
}

/* --- 3. audit the live mark -------------------------------------------- */
function auditMark() {
  const svg = document.querySelector('svg[aria-label="Puzzle"]');
  const paths = svg ? [...svg.querySelectorAll("path")] : [];
  const groups = svg ? [...svg.querySelectorAll("g")] : [];
  const cs = svg ? getComputedStyle(svg) : null;
  return {
    pathCount: paths.length,
    svgFill: cs?.fill,
    svgStroke: cs?.stroke,
    strokeWidth: cs?.strokeWidth,
    pathFills: paths.map((p) => getComputedStyle(p).fill).join(" | "),
    backgroundRect: !!svg?.querySelector("rect"),
    wordmarkPresent: /puzzle/i.test(svg?.parentElement?.textContent ?? ""),
    // Residual transform after the lock would mean a gap on the seam.
    groupTransforms: groups.map((g) => g.getAttribute("transform") ?? "none").join(" | "),
    // Dash state should be fully drawn by now.
    dashOffsets: paths.map((p) => getComputedStyle(p).strokeDashoffset).join(" | "),
  };
}

/* --- 4. reduced-motion path ------------------------------------------- */
const rmCtx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});
const rmPage = await rmCtx.newPage();
await rmPage.goto(base, { waitUntil: "commit" });
// Anchor on the mark existing — a fixed delay here just captures the
// pre-hydration blank and looks like the static state is missing.
try {
  await rmPage.waitForSelector('svg[aria-label="Puzzle"]', { timeout: 15000 });
  await rmPage.screenshot({ path: join(out, "loader-rm-static.png") });
  console.log("  reduced-motion: static mark captured");
} catch {
  console.log("  reduced-motion: FAILED — mark never appeared");
}
await rmPage.waitForTimeout(1200);
await rmPage.screenshot({ path: join(out, "loader-rm-cleared.png") });

await browser.close();

for (const [frame, audit] of Object.entries(audits)) {
  console.log(`\n--- mark audit @ ${frame} ---`);
  for (const [k, v] of Object.entries(audit)) console.log(`  ${k}: ${v}`);
}
console.log("\n--- console errors ---");
console.log(errors.length ? errors.map((e) => "  " + e).join("\n") : "  none");
