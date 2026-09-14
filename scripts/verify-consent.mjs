/**
 * Verifies the cookie banner and Google Consent Mode v2.
 * Usage: node scripts/verify-consent.mjs [baseUrl]
 *
 * Reads consent off `window.dataLayer`, which is what gtag.js consumes in
 * order — so "default before config" and "restored before config" are
 * asserted as positions in that queue, not inferred from the UI.
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const pass = [];
const fail = [];
const check = (ok, label) => (ok ? pass : fail).push(label);

async function newContext() {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  return ctx;
}

const queue = (page) =>
  page.evaluate(() =>
    (window.dataLayer ?? [])
      .filter((e) => e && typeof e === "object" && typeof e.length === "number")
      .map((e) => Array.from(e))
      .filter((a) => ["consent", "js", "config"].includes(a[0]))
      .map((a) => [a[0], a[1] instanceof Date ? "date" : a[1], a[2] ?? null]),
  );

const stored = (page) =>
  page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem("puzzle:consent"));
    } catch {
      return null;
    }
  });

const banner = (page) => page.locator("[data-cookie-consent]");
const idx = (q, pred) => q.findIndex(pred);
const configAt = (q) => idx(q, (a) => a[0] === "config");
const grantedUpdates = (q) =>
  q.filter(
    (a) => a[0] === "consent" && a[1] === "update" && a[2]?.analytics_storage === "granted",
  );

const settle = (page) => page.waitForTimeout(800);

/* =========================================== tag appears once, on all pages */
{
  const ctx = await newContext();
  const page = await ctx.newPage();
  for (const path of ["/", "/terms", "/privacy", "/work", "/contact"]) {
    await page.goto(base + path, { waitUntil: "load" });
    const t = await page.evaluate(() => ({
      loaders: document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').length,
      gtm: document.querySelectorAll('script[src*="gtm.js"]').length,
      /* Counted as calls that actually ran, not as script text: Next's RSC
         payload (`self.__next_f.push`) carries the layout's markup as a string,
         so a text search finds the config line again in data that never runs. */
      inlineConfig: (window.dataLayer ?? []).filter(
        (e) => e && typeof e.length === "number" && e[0] === "config",
      ).length,
      inHead: !!document.head.querySelector('script[src*="gtag/js?id=G-HZ6V0BP7HR"]'),
    }));
    check(t.loaders === 1 && t.inHead, `${path}: one gtag.js loader, in <head> (${t.loaders})`);
    check(t.inlineConfig === 1, `${path}: one inline config script (${t.inlineConfig})`);
    check(t.gtm === 0, `${path}: no Google Tag Manager container`);
  }
  await ctx.close();
}

/* ============================================================ first visit */
const ctx = await newContext();
const page = await ctx.newPage();
await page.goto(base, { waitUntil: "load" });
await settle(page);
{
  const q = await queue(page);
  const def = idx(q, (a) => a[0] === "consent" && a[1] === "default");
  const d = q[def]?.[2] ?? {};
  check(
    d.analytics_storage === "denied" &&
      d.ad_storage === "denied" &&
      d.ad_user_data === "denied" &&
      d.ad_personalization === "denied",
    "first visit: all four signals default to denied",
  );
  check(def > -1 && def < configAt(q), `first visit: default (${def}) queued before config (${configAt(q)})`);
  check(grantedUpdates(q).length === 0, "first visit: nothing grants analytics");
  check(await banner(page).isVisible(), "first visit: banner is shown");
  check(
    (await banner(page).locator("button").count()) === 2,
    "first visit: exactly two choices, no close button",
  );
  check(
    (await page.locator("[data-cookie-consent] input").count()) === 0,
    "first visit: no pre-ticked (or any) controls",
  );

  // Scrolling and clicking elsewhere are not consent.
  await page.mouse.wheel(0, 1500);
  await page.mouse.click(700, 300);
  await page.waitForTimeout(400);
  check(
    (await stored(page)) === null && grantedUpdates(await queue(page)).length === 0,
    "scroll + click elsewhere: nothing stored, nothing granted",
  );
  check(await banner(page).isVisible(), "scroll + click elsewhere: banner still asking");

  // Browsing on is not consent either.
  await page.goto(`${base}/about`, { waitUntil: "load" });
  await settle(page);
  check(
    (await banner(page).isVisible()) && (await stored(page)) === null,
    "navigating to another page: still asking, nothing stored",
  );

  // Keyboard: both buttons reachable, visible focus ring.
  const buttons = banner(page).locator("button");
  await buttons.nth(0).focus();
  const ring = await buttons.nth(0).evaluate((el) => {
    const s = getComputedStyle(el);
    return `${s.outlineStyle} ${s.outlineWidth}`;
  });
  check(ring.startsWith("solid") && ring !== "solid 0px", `keyboard: focus ring on accept (${ring})`);
  await page.keyboard.press("Tab");
  check(
    await buttons.nth(1).evaluate((el) => el === document.activeElement),
    "keyboard: Tab moves from accept to reject",
  );

  // Contrast of the body copy on the panel.
  const ratio = await banner(page).evaluate((el) => {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const pen = c.getContext("2d", { willReadFrequently: true });
    const lum = (col) => {
      pen.clearRect(0, 0, 1, 1);
      pen.fillStyle = col;
      pen.fillRect(0, 0, 1, 1);
      const [r, g, b] = [...pen.getImageData(0, 0, 1, 1).data].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const bg = getComputedStyle(el).backgroundColor;
    const out = {};
    for (const [k, sel] of [["body", "p"], ["label", "h2"], ["button", "button"]]) {
      const [x, y] = [lum(bg), lum(getComputedStyle(el.querySelector(sel)).color)].sort((m, n) => n - m);
      out[k] = Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
    }
    return out;
  });
  check(
    ratio.body >= 4.5 && ratio.label >= 4.5 && ratio.button >= 4.5,
    `contrast: body ${ratio.body}:1, label ${ratio.label}:1, buttons ${ratio.button}:1`,
  );
  await page.screenshot({ path: ".preview/consent-desktop.png" });
}

/* ================================================================= accept */
{
  await banner(page).getByRole("button", { name: "Accept analytics" }).click();
  await page.waitForTimeout(300);
  const q = await queue(page);
  const last = q.filter((a) => a[0] === "consent").at(-1)?.[2] ?? {};
  check(last.analytics_storage === "granted", "accept: analytics_storage updated to granted");
  check(
    last.ad_storage === "denied" && last.ad_user_data === "denied" && last.ad_personalization === "denied",
    "accept: ad signals stay denied",
  );
  check((await stored(page))?.analytics === "granted", "accept: choice stored");
  check(!(await banner(page).isVisible()), "accept: banner closes");

  await page.reload({ waitUntil: "load" });
  await settle(page);
  const r = await queue(page);
  const g = idx(r, (a) => a[0] === "consent" && a[1] === "update" && a[2]?.analytics_storage === "granted");
  check(g > -1 && g < configAt(r), `accept → reload: granted restored (${g}) before config (${configAt(r)})`);
  check(!(await banner(page).isVisible()), "accept → reload: banner stays away");
}

/* ======================================================= reopen and reject */
{
  // Give GA a cookie to clear, as it would have after an accept.
  await page.evaluate(() => {
    document.cookie = "_ga=GA1.1.123.456; path=/";
    document.cookie = "_ga_HZ6V0BP7HR=GS1.1.1; path=/";
  });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  const link = page.locator("[data-site-footer]").getByRole("button", { name: "Cookie settings" });
  check((await link.count()) === 1, "footer: one Cookie settings control");
  await link.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  check(await banner(page).isVisible(), "reopen: Enter on footer control opens the panel");
  check(
    await banner(page).evaluate((el) => el.contains(document.activeElement)),
    "reopen: focus moves into the panel",
  );
  check(
    (await banner(page).textContent()).includes("analytics accepted"),
    "reopen: shows the current choice",
  );

  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  check(
    !(await banner(page).isVisible()) && (await stored(page))?.analytics === "granted",
    "reopen → Escape: closes, choice unchanged",
  );

  await link.click();
  await page.waitForTimeout(300);
  await banner(page).getByRole("button", { name: "Reject optional cookies" }).click();
  await page.waitForTimeout(300);
  const q = await queue(page);
  const last = q.filter((a) => a[0] === "consent").at(-1)?.[2] ?? {};
  check(last.analytics_storage === "denied", "change to reject: analytics_storage updated to denied");
  check((await stored(page))?.analytics === "denied", "change to reject: choice stored");
  const cookies = await page.evaluate(() => document.cookie);
  check(!/(^|; )_ga/.test(cookies), `change to reject: _ga cookies removed ("${cookies}")`);

  await page.reload({ waitUntil: "load" });
  await settle(page);
  const r = await queue(page);
  check(grantedUpdates(r).length === 0, "reject → reload: analytics never granted, not even briefly");
  check(!(await banner(page).isVisible()), "reject → reload: banner stays away");
}
await ctx.close();

/* =================================== reject from the first-visit banner */
{
  const c2 = await newContext();
  const p2 = await c2.newPage();
  await p2.setViewportSize({ width: 390, height: 844 });
  await p2.goto(base, { waitUntil: "load" });
  await settle(p2);
  const box = await banner(p2).boundingBox();
  check(box && box.x >= 15 && box.x + box.width <= 390 - 15, `mobile: banner inside the gutters (${box?.x}, ${box?.width})`);
  const overflow = await p2.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 0, `mobile: no horizontal overflow (${overflow}px)`);
  await p2.screenshot({ path: ".preview/consent-mobile.png" });

  await banner(p2).getByRole("button", { name: "Reject optional cookies" }).click();
  await p2.waitForTimeout(300);
  const q = await queue(p2);
  check(grantedUpdates(q).length === 0, "reject: analytics stays denied");
  check((await stored(p2))?.analytics === "denied", "reject: choice stored");
  await p2.goto(`${base}/work`, { waitUntil: "load" });
  await settle(p2);
  check(!(await banner(p2).isVisible()), "reject → next page: banner stays away");
  check(grantedUpdates(await queue(p2)).length === 0, "reject → next page: still denied");
  await c2.close();
}

/* ========================================================= privacy policy */
{
  const c3 = await newContext();
  const p3 = await c3.newPage();
  await p3.goto(base, { waitUntil: "load" });
  await settle(p3);

  const bannerLink = banner(p3).locator('a[href="/privacy"]');
  check((await bannerLink.count()) === 1, "banner: links to the Privacy Policy");
  await bannerLink.click();
  await p3.waitForURL(/\/privacy$/, { timeout: 5000 }).catch(() => {});
  await settle(p3);
  check(/\/privacy$/.test(p3.url()), `banner link: navigates to /privacy (${p3.url()})`);
  const res = await p3.request.get(`${base}/privacy`);
  check(res.status() === 200, `/privacy: responds 200 (${res.status()})`);
  check(
    (await p3.locator("h1").textContent())?.replace(/\s+/g, " ").trim().toLowerCase() === "privacy policy",
    "/privacy: heading reads Privacy policy",
  );
  check(
    (await stored(p3)) === null && grantedUpdates(await queue(p3)).length === 0,
    "banner link: following it is not consent (nothing stored, nothing granted)",
  );
  check(await banner(p3).isVisible(), "banner link: banner still asking on /privacy");

  const body = (await p3.locator("article").textContent()) ?? "";
  for (const phrase of [
    "Google Analytics 4",
    "Google Consent Mode",
    "analytics_storage",
    "ad_storage",
    "ad_user_data",
    "ad_personalization",
    "Your data protection rights",
    "Information Commissioner",
    "How long we keep information",
  ]) {
    check(body.includes(phrase), `/privacy: covers "${phrase}"`);
  }
  check(
    (await p3.locator('article a[href="mailto:enquiries@puzzlestudios.co.uk"]').count()) > 0,
    "/privacy: privacy contact is enquiries@puzzlestudios.co.uk",
  );
  check(
    (await p3.locator('[data-site-footer] a[href="/privacy"]').count()) === 1 &&
      (await p3.locator('[data-site-footer] a[href="/terms"]').count()) === 1,
    "footer: Privacy Policy link beside Terms & Conditions",
  );

  // Accept, then change the choice from the policy's own control.
  await banner(p3).getByRole("button", { name: "Accept analytics" }).click();
  await p3.waitForTimeout(300);
  const inPolicy = p3.locator("article").getByRole("button", { name: "Cookie settings" });
  check((await inPolicy.count()) === 1, "/privacy: in-page Cookie settings control");
  await inPolicy.click();
  await p3.waitForTimeout(300);
  check(
    (await banner(p3).isVisible()) &&
      (await banner(p3).textContent()).includes("analytics accepted"),
    "/privacy: in-page control reopens the panel with the current choice",
  );
  await banner(p3).getByRole("button", { name: "Reject optional cookies" }).click();
  await p3.waitForTimeout(300);
  const last = (await queue(p3)).filter((a) => a[0] === "consent").at(-1)?.[2] ?? {};
  check(
    last.analytics_storage === "denied" && (await stored(p3))?.analytics === "denied",
    "/privacy: rejecting from the policy page denies and stores",
  );
  await p3.screenshot({ path: ".preview/privacy-desktop.png" });
  await c3.close();
}

await browser.close();
console.log("\nPASS");
for (const p of pass) console.log("  ✓ " + p);
if (fail.length) {
  console.log("\nFAIL");
  for (const f of fail) console.log("  ✗ " + f);
}
console.log(`\n${pass.length} passed, ${fail.length} failed`);
process.exit(fail.length ? 1 : 0);
