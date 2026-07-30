/**
 * Dev-only: proves the Services mega-menu survives the pointer travelling from
 * the trigger into every one of its links.
 *
 * The interesting part is the traversal: it moves in many small steps rather
 * than one jump, because a single mouse.move() teleports past any dead zone and
 * passes a test that a real diagonal drag would fail.
 *
 * Usage: node scripts/verify-nav-hover.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:3000";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".preview/nav");
mkdirSync(out, { recursive: true });

const pass = [];
const fail = [];
const check = (ok, label) => (ok ? pass : fail).push(label);

const PANEL = 'header a[href^="/services/"]';
const panelOpen = (page) => page.locator(PANEL).first().isVisible().catch(() => false);

const browser = await chromium.launch();

/* ------------------------------------------------ hover traversal ------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(900);

  const trigger = page.getByRole("button", { name: "Services" }).first();
  const tBox = await trigger.boundingBox();
  const from = { x: tBox.x + tBox.width / 2, y: tBox.y + tBox.height / 2 };

  await page.mouse.move(from.x, from.y);
  await page.waitForTimeout(600);
  check(await panelOpen(page), "panel opens on hovering the Services trigger");
  await page.screenshot({ path: join(out, "01-open.png") });

  // Snapshot the targets NOW, while the panel is open. Re-querying them
  // mid-traversal fails with a locator timeout the moment the panel closes,
  // which crashes the run instead of reporting the failure.
  const targets = await page.evaluate(
    (sel) =>
      [...document.querySelectorAll(sel)].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          label: (el.textContent ?? "").trim().split("\n")[0],
          x: r.x + r.width / 2,
          y: r.y + r.height / 2,
        };
      }),
    PANEL,
  );
  check(targets.length >= 7, `panel exposes the services column (${targets.length} links)`);

  // Walk into every option, slowly and diagonally, re-hovering the trigger
  // between each so the traversal always starts from the same place.
  let survived = 0;
  let firstFailure = null;

  for (const { label, x: tx, y: ty } of targets) {
    const to = { x: tx, y: ty };

    await page.mouse.move(from.x, from.y);
    await page.waitForTimeout(250);

    const STEPS = 24;
    let closedAt = null;
    for (let i = 1; i <= STEPS; i++) {
      const t = i / STEPS;
      await page.mouse.move(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
      await page.waitForTimeout(18);
      if (closedAt === null && !(await panelOpen(page))) closedAt = t;
    }

    const stillOpen = await panelOpen(page);
    if (stillOpen) survived++;
    else if (!firstFailure)
      firstFailure = `"${label}" — panel closed ${Math.round((closedAt ?? 1) * 100)}% of the way across`;
  }

  check(
    survived === targets.length,
    survived === targets.length
      ? `pointer reached all ${targets.length} options with the panel still open`
      : `only ${survived}/${targets.length} options reachable — ${firstFailure}`,
  );

  /* the link must still navigate */
  if (await panelOpen(page)) {
    await page.screenshot({ path: join(out, "02-hovering-option.png") });
    await page.locator(PANEL).first().click();
    await page.waitForURL(/\/services\//, { timeout: 5000 }).catch(() => {});
    check(/\/services\//.test(page.url()), `clicking an option navigates (${page.url().replace(base, "")})`);
  } else {
    fail.push("could not test navigation — panel was already closed");
  }

  await ctx.close();
}

/* ------------------------------------------------------- keyboard ------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(900);

  await page.getByRole("button", { name: "Services" }).first().focus();
  await page.waitForTimeout(400);
  check(await panelOpen(page), "panel opens when the trigger receives keyboard focus");

  // Tab should walk into the panel's links, not be trapped on the trigger.
  await page.keyboard.press("Tab");
  await page.waitForTimeout(250);
  const focusedHref = await page.evaluate(
    () => document.activeElement?.getAttribute("href") ?? null,
  );
  check(
    focusedHref?.startsWith("/services/") ?? false,
    `Tab moves focus into the panel (landed on ${focusedHref})`,
  );

  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  check(!(await panelOpen(page)), "Escape closes the panel");
  const backOnTrigger = await page.evaluate(
    () => document.activeElement?.textContent?.trim() === "Services",
  );
  check(backOnTrigger, "Escape returns focus to the trigger");

  await ctx.close();
}

/* ------------------------------------ overflow + mobile untouched ------ */
for (const width of [768, 1024, 1440, 2560]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);

  const trigger = page.getByRole("button", { name: "Services" }).first();
  if (await trigger.isVisible()) {
    await trigger.hover();
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check(overflow <= 1, `no horizontal overflow with panel open @${width} (${overflow}px)`);
    await page.screenshot({ path: join(out, `open-${width}.png`) });
  }
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const menuBtn = page.getByRole("button", { name: "Menu" });
  check(await menuBtn.isVisible(), "mobile still shows the Menu button");
  const desktopNav = page.getByRole("button", { name: "Services" });
  check(
    (await desktopNav.count()) === 0 || !(await desktopNav.first().isVisible()),
    "mobile does not show the desktop Services trigger",
  );
  await ctx.close();
}

await browser.close();

console.log("\n--- passed ---");
pass.forEach((p) => console.log("  ✓ " + p));
console.log("\n--- failed ---");
console.log(fail.length ? fail.map((f) => "  ✗ " + f).join("\n") : "  none");
process.exitCode = fail.length ? 1 : 0;
