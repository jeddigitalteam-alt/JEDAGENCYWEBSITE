/**
 * Dev-only: walks every route, collects console/page errors, checks a handful
 * of things that are easy to regress silently, and captures screenshots at
 * three widths. Output is gitignored.
 *
 * Usage: node scripts/verify-routes.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:3000";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".preview/routes");
mkdirSync(out, { recursive: true });

const ROUTES = [
  "/",
  "/work",
  "/work/levant",
  "/work/northbank",
  "/services",
  "/services/brand-identity",
  "/industries",
  "/industries/sports",
  "/how-we-work",
  "/about",
  "/labs",
  "/articles",
  "/articles/the-tenth-screen",
  "/contact",
  "/this-route-does-not-exist",
];

const WIDTHS = [
  [360, "360"],
  [1440, "1440"],
  [2560, "2560"],
];

const browser = await chromium.launch();
const failures = [];
const notes = [];

for (const [width, tag] of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: width === 360 ? 780 : 900 },
    deviceScaleFactor: 1,
  });
  // Skip the intro on every page but the first capture — it covers the content.
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });

  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

    const res = await page.goto(base + route, { waitUntil: "load" });
    await page.waitForTimeout(700);

    const status = res?.status() ?? 0;
    const expected404 = route === "/this-route-does-not-exist";
    if (!expected404 && status >= 400) {
      failures.push(`${route} @${tag} → HTTP ${status}`);
    }

    // Horizontal overflow is the classic responsive regression.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    if (overflow > 1) {
      failures.push(`${route} @${tag} → body overflows by ${overflow}px`);
    }

    // The 404 route is *expected* to log a failed-resource error: that's the
    // browser reporting the HTTP status, not a fault in the page.
    const real = expected404
      ? errors.filter((e) => !/status of 404/.test(e))
      : errors;
    if (real.length) {
      failures.push(`${route} @${tag} → ${real.length} console error(s): ${real[0]}`);
    }

    if (tag === "1440") {
      await page.screenshot({
        path: join(out, `${route.replace(/\W+/g, "_") || "home"}.png`),
        fullPage: false,
      });
    }

    await page.close();
  }

  await ctx.close();
  console.log(`checked ${ROUTES.length} routes @ ${tag}px`);
}

/* --- keyboard + a11y spot checks on one representative page ------------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });

  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, text: el?.textContent?.trim().slice(0, 30) };
  });
  if (!/skip/i.test(firstFocus.text ?? "")) {
    failures.push(`first Tab stop is "${firstFocus.text}" — expected skip link`);
  } else {
    notes.push(`skip link is first tab stop ("${firstFocus.text}")`);
  }

  const ring = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? getComputedStyle(el).outlineColor : null;
  });
  notes.push(`focus outline colour: ${ring}`);

  // ⌘K palette
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(300);
  const paletteOpen = await page.evaluate(
    () => !!document.querySelector('[role="dialog"][aria-label="Jump to a page"]'),
  );
  notes.push(`⌘K palette opens: ${paletteOpen}`);
  if (!paletteOpen) failures.push("⌘K did not open the command palette");

  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  const paletteClosed = await page.evaluate(
    () => !document.querySelector('[role="dialog"][aria-label="Jump to a page"]'),
  );
  if (!paletteClosed) failures.push("Esc did not close the command palette");
  else notes.push("Esc closes the palette");

  // images have alt text
  const missingAlt = await page.evaluate(
    () => [...document.querySelectorAll("img")].filter((i) => !i.alt).length,
  );
  if (missingAlt) failures.push(`${missingAlt} img element(s) without alt on /`);
  else notes.push("all images on / have alt text");

  await ctx.close();
}

await browser.close();

console.log("\n--- notes ---");
notes.forEach((n) => console.log("  " + n));
console.log("\n--- failures ---");
console.log(failures.length ? failures.map((f) => "  " + f).join("\n") : "  none");
process.exitCode = failures.length ? 1 : 0;
