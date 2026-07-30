/**
 * Dev-only: proves the hero backdrop actually parallaxes, that the layers move
 * at genuinely different rates, and that nothing outside the hero moved.
 *
 * Usage: node scripts/verify-hero-parallax.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:3000";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".preview/parallax");
mkdirSync(out, { recursive: true });

const pass = [];
const fail = [];
const check = (ok, label) => (ok ? pass : fail).push(label);

const LAYERS = 'main section:first-of-type > div[aria-hidden="true"]';

/**
 * Scroll with REAL wheel events so the input travels through Lenis, exactly as
 * a trackpad or mouse would. `window.scrollTo()` bypasses Lenis entirely and
 * will happily report movement that a user never experiences — that is how the
 * first version of this test passed against an effect that looked static.
 */
async function wheelTo(page, target) {
  await page.mouse.move(700, 500);
  for (let guard = 0; guard < 60; guard++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y >= target - 24) break;
    await page.mouse.wheel(0, Math.min(120, Math.max(40, target - y)));
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(550); // let Lenis settle
}

/** translateY out of a computed matrix, or 0 for `none`. */
const readY = (page) =>
  page.evaluate((sel) => {
    const parse = (t) => {
      if (!t || t === "none") return 0;
      const m = t.match(/matrix\(([^)]+)\)/);
      if (m) return parseFloat(m[1].split(",")[5]);
      const m3 = t.match(/matrix3d\(([^)]+)\)/);
      if (m3) return parseFloat(m3[1].split(",")[13]);
      return 0;
    };
    return [...document.querySelectorAll(sel)]
      .slice(0, 3)
      .map((el) => Math.round(parse(getComputedStyle(el).transform) * 100) / 100);
  }, LAYERS);

const browser = await chromium.launch();

/* ---------------------------------------------- layer movement -------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(1000);

  // --- at rest
  const atTop = await readY(page);
  check(
    atTop.every((y) => y === 0),
    `all layers at identity when page is at top (${JSON.stringify(atTop)})`,
  );
  await page.screenshot({ path: join(out, "01-top.png") });

  const heroBox = await page.locator("main section").first().boundingBox();
  const overflowHidden = await page.evaluate(
    () => getComputedStyle(document.querySelector("main section")).overflow,
  );
  check(/hidden|clip/.test(overflowHidden), `hero clips its backdrop (overflow: ${overflowHidden})`);

  // --- halfway through the hero, driven by real wheel input
  await wheelTo(page, 450);
  const heroTopMid = await page.evaluate(
    () => Math.round(document.querySelector("main section").getBoundingClientRect().top),
  );
  check(
    heroTopMid < -300 && heroTopMid > -600,
    `wheel scrolling actually moved the hero (top at ${heroTopMid}px)`,
  );
  const mid = await readY(page);
  await page.screenshot({ path: join(out, "02-scrolled.png") });

  check(mid.every((y) => y > 0), `every layer moved (${JSON.stringify(mid)})`);
  check(
    mid[0] < mid[1] && mid[1] < mid[2],
    `layers move at distinct, increasing rates (${mid[0]} < ${mid[1]} < ${mid[2]})`,
  );
  // A differential you can actually perceive, not merely measure.
  check(
    mid[2] - mid[0] >= 100,
    `depth spread is perceptible, not just measurable (${(mid[2] - mid[0]).toFixed(1)}px)`,
  );
  check(
    mid[2] >= 110,
    `front layer travel is in the visible range (${mid[2]}px at half-hero)`,
  );

  // --- text must NOT be carrying a parallax transform of its own
  const textY = await page.evaluate(() => {
    const h1 = document.querySelector("main section h1");
    const t = getComputedStyle(h1).transform;
    return t === "none" ? 0 : parseFloat(t.match(/matrix\(([^)]+)\)/)?.[1].split(",")[5] ?? "0");
  });
  check(textY === 0, `headline itself is not parallaxed (translateY ${textY})`);

  const z = await page.evaluate(
    () => getComputedStyle(document.querySelector("main section h1")).zIndex,
  );
  check(z === "10", `content sits above the backdrop (z-index ${z})`);

  // --- decorative layers are inert
  const inert = await page.evaluate((sel) =>
    [...document.querySelectorAll(sel)].every(
      (el) =>
        el.getAttribute("aria-hidden") === "true" &&
        getComputedStyle(el).pointerEvents === "none",
    ), LAYERS);
  check(inert, "all backdrop layers are aria-hidden and pointer-events: none");

  // --- nothing below the hero shifted or gained a transform
  const belowOk = await page.evaluate(() => {
    const sections = [...document.querySelectorAll("main section")];
    const hero = sections[0];
    const next = sections[1];
    if (!next) return { ok: false, why: "no section after hero" };
    const gap = Math.round(
      next.getBoundingClientRect().top - hero.getBoundingClientRect().bottom,
    );
    const transformed = sections
      .slice(1)
      .filter((s) => getComputedStyle(s).transform !== "none").length;
    return { ok: gap === 0 && transformed === 0, gap, transformed };
  });
  check(
    belowOk.ok,
    `no gap or transform below the hero (gap ${belowOk.gap}px, ${belowOk.transformed} transformed)`,
  );

  const headerT = await page.evaluate(
    () => getComputedStyle(document.querySelector("header")).transform,
  );
  check(headerT === "none", `navigation is not parallaxed (transform: ${headerT})`);

  // --- past the hero, layers park and stop
  await wheelTo(page, 2400);
  const past = await readY(page);
  check(
    past.every((y) => Number.isFinite(y)),
    `layers hold finite values past the hero (${JSON.stringify(past)})`,
  );
  await page.screenshot({ path: join(out, "03-past-hero.png") });

  check(!!heroBox, "hero measured");
  await ctx.close();
}

/* ------------------------------------------------- reduced motion ----- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await wheelTo(page, 450);
  const y = await readY(page);
  check(y.every((v) => v === 0), `reduced motion keeps the backdrop static (${JSON.stringify(y)})`);
  await page.screenshot({ path: join(out, "04-reduced-motion.png") });
  await ctx.close();
}

/* ------------------------------------- overflow across breakpoints ---- */
for (const width of [390, 768, 1024, 1440, 2560]) {
  const ctx = await browser.newContext({ viewport: { width, height: 880 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
  await wheelTo(page, 400);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(overflow <= 1, `no horizontal overflow mid-scroll @${width} (${overflow}px)`);
  // Blank edges only show while a layer is displaced — check at the extreme.
  const gaps = await page.evaluate((sel) => {
    const hero = document.querySelector("main section").getBoundingClientRect();
    return [...document.querySelectorAll(sel)].slice(0, 3).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top > hero.top + 1 || r.bottom < hero.bottom - 1;
    }).length;
  }, LAYERS);
  check(gaps === 0, `no layer exposes an edge while displaced @${width} (${gaps} short)`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(out, `top-${width}.png`) });
  await ctx.close();
}

await browser.close();

console.log("\n--- passed ---");
pass.forEach((p) => console.log("  ✓ " + p));
console.log("\n--- failed ---");
console.log(fail.length ? fail.map((f) => "  ✗ " + f).join("\n") : "  none");
process.exitCode = fail.length ? 1 : 0;
