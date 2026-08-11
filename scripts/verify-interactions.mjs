/**
 * Dev-only: exercises the signature interactions and asserts they do what they
 * claim. Rendering correctly is not the same as working, and these are the
 * pieces most likely to break silently.
 *
 * Usage: node scripts/verify-interactions.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:3000";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".preview/interactions");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  try {
    sessionStorage.setItem("puzzle:intro-seen", "1");
  } catch {}
});
const page = await ctx.newPage();
const pass = [];
const fail = [];
const check = (ok, label) => (ok ? pass : fail).push(label);

/* ---------------------------------------------- scope builder (headline) */
await page.goto(`${base}/services`, { waitUntil: "load" });
await page.getByRole("button", { name: "+ Brand identity" }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "+ Web design" }).click();
await page.waitForTimeout(600);

const sendLabel = await page
  .locator("button", { hasText: "Send this scope" })
  .first()
  .textContent();
check(/\d+ weeks/.test(sendLabel ?? ""), `scope estimate renders — "${sendLabel?.trim()}"`);

// Overlap maths: 8w identity + 7w web design should be < 15w if overlapping.
const weeks = Number((sendLabel ?? "").match(/(\d+) weeks/)?.[1] ?? 0);
check(weeks > 0 && weeks < 15, `phases overlap rather than sum (${weeks}w < 15w)`);

await page.screenshot({ path: join(out, "scope-builder.png") });

await page.locator("button", { hasText: "Send this scope" }).first().click();
await page.waitForURL(/\/contact\?/, { timeout: 5000 }).catch(() => {});
check(page.url().includes("scope="), `send navigates with scope params`);

/* ------------------------------------------------ contact prefill + gate */
await page.waitForTimeout(600);
const loaded = await page.locator("text=Scope loaded").count();
check(loaded > 0, "contact form shows the handed-over scope");

const notConfigured = await page.locator("text=Form not configured").count();
check(
  notConfigured > 0,
  "contact form declares itself unconfigured (no FORMSPREE_ID) rather than faking a send",
);
await page.screenshot({ path: join(out, "contact-prefilled.png") });

/* ----------------------------------------------------------- mega menu
   Services and Industries are two top-level items with a panel each. This
   used to assert the industries column *inside* the services panel; that
   nesting is gone deliberately, so the assertion is now that each panel
   carries its own list and neither carries the other's. */
await page.goto(base, { waitUntil: "load" });
await page.getByRole("button", { name: "Services", exact: true }).first().hover();
await page.waitForTimeout(500);
const servicePanelLinks = await page
  .locator('header a[href^="/services/"]')
  .count();
const strayIndustries = await page
  .locator('header a[href^="/industries/"]')
  .count();
check(
  servicePanelLinks >= 7 && strayIndustries === 0,
  `services panel lists services only (${servicePanelLinks} services, ${strayIndustries} industries)`,
);
await page.screenshot({ path: join(out, "mega-menu.png") });

await page.getByRole("button", { name: "Industries", exact: true }).first().hover();
await page.waitForTimeout(500);
const industryPanelLinks = await page
  .locator('header a[href^="/industries/"]')
  .count();
check(
  industryPanelLinks >= 7,
  `industries has its own panel (${industryPanelLinks} links)`,
);
await page.keyboard.press("Escape");
// AnimatePresence runs a 0.32s exit — wait past it before asserting removal.
await page.waitForTimeout(900);
check(
  (await page.locator('header a[href^="/industries/"]').count()) === 0,
  "Esc closes the mega-menu",
);

/* ---------------------------------------------------------------- labs */
await page.goto(`${base}/labs`, { waitUntil: "load" });
await page.waitForTimeout(500);
// Labs carries several canvas experiments; these assertions are about the
// piece-physics field, which is the first one on the page. It sits below the
// fold, so scroll it in and re-measure — clicking a stale box misses entirely.
const canvas = page.locator("canvas").first();
await canvas.scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
const box = await canvas.boundingBox();
if (box) {
  for (const dx of [0.35, 0.5, 0.65]) {
    await page.mouse.click(box.x + box.width * dx, box.y + box.height * 0.25);
    await page.waitForTimeout(220);
  }
}
await page.waitForTimeout(1500);
const pieceCount = await page.locator("text=/\\d{3} pieces/").first().textContent();
check(/00[1-9]|0[1-9]\d/.test(pieceCount ?? ""), `labs drops pieces — "${pieceCount?.trim()}"`);

// The count can increment while nothing is actually drawn — sample the canvas
// for non-background pixels to prove the pieces render.
const painted = await canvas.evaluate((el) => {
  const c = el;
  const ctx = c.getContext("2d");
  if (!ctx) return 0;
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  let lit = 0;
  for (let i = 3; i < data.length; i += 4 * 97) if (data[i] > 8) lit++;
  return lit;
});
check(painted > 0, `labs canvas actually paints pieces (${painted} lit samples)`);
await canvas.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: join(out, "labs.png") });

/* --------------------------------------------- cursor label regression */
// Regression: `data-cursor="on"` on <body> once made closest("[data-cursor]")
// match from anywhere, so every hover rendered a disc labelled "on".
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(500);
const bodyCursorAttr = await page.evaluate(() =>
  document.body.getAttribute("data-cursor"),
);
check(
  bodyCursorAttr === null,
  `<body> carries no data-cursor label attribute (got ${bodyCursorAttr})`,
);

/* --------------------------------------------------------------- about */
/* The draggable team board is gone. It was eight named cards with bios and a
   "n / 8 seated" counter, on a page rebuilt around what a client gets rather
   than who we are — headcount was the one thing it was not allowed to state.
   What replaces those two assertions is the constraint itself: no number of
   people, anywhere on the page. */
await page.goto(`${base}/about`, { waitUntil: "load" });
await page.waitForTimeout(700);
const aboutText = await page.evaluate(() => document.body.innerText);
const headcount =
  /(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)[- ](?:person|people|strong)/i.exec(
    aboutText,
  ) ??
  /team of/i.exec(aboutText) ??
  /\d+\s*\/\s*\d+\s*seated/i.exec(aboutText) ??
  /small (?:team|studio|agency)/i.exec(aboutText);
check(
  headcount === null,
  `about page states no headcount${headcount ? ` — found "${headcount[0]}"` : ""}`,
);

const aboutHeadings = await page.$$eval("h1, h2", (els) =>
  els.map((e) => e.textContent.trim()),
);
check(
  aboutHeadings[0] === "Built for businesses going somewhere",
  `about leads on the client, not the studio — "${aboutHeadings[0]}"`,
);
check(
  aboutHeadings.length >= 5,
  `about has its full section structure (${aboutHeadings.length} headings)`,
);
// Scoped to <main>: the last /contact link in the document is the footer's.
const aboutCta = await page
  .locator('main a[href="/contact"]')
  .last()
  .textContent();
check(
  /Start a project/i.test(aboutCta ?? ""),
  `about closes on a CTA — "${aboutCta?.trim()}"`,
);
await page.screenshot({ path: join(out, "about.png"), fullPage: true });

/* ----------------------------------------------------- industries filter */
await page.goto(`${base}/industries`, { waitUntil: "load" });
await page.waitForTimeout(400);
// Count the cards themselves, not the clickable ones: only studies with a
// written case study are interactive now, so counting buttons would measure
// clickability rather than whether the filter narrowed the grid.
const cards = page.locator("ul[data-case-grid] > li");
const before = await cards.count();
await page.getByRole("button", { name: /^Sports/ }).click();
await page.waitForTimeout(700);
const after = await cards.count();
check(after > 0 && after < before, `filter narrows the grid (${before} → ${after})`);
await page.screenshot({ path: join(out, "industries-filtered.png") });

await browser.close();

console.log("\n--- passed ---");
pass.forEach((p) => console.log("  ✓ " + p));
console.log("\n--- failed ---");
console.log(fail.length ? fail.map((f) => "  ✗ " + f).join("\n") : "  none");
process.exitCode = fail.length ? 1 : 0;
