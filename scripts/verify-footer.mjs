/**
 * Verifies the underlapping footer + homepage peek.
 * Usage: node verify-footer.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const pass = [];
const fail = [];
const check = (ok, label) => (ok ? pass : fail).push(label);

async function newPage({ width, height, reduced }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  return [await ctx.newPage(), ctx];
}

/** Scroll to a fraction of the PAGE runway (as FooterReveal measures it). */
const gotoProgress = (page, p) =>
  page.evaluate((p) => {
    const layer = document.querySelector("[data-page-layer]");
    const rect = layer.getBoundingClientRect();
    const runway = rect.bottom + window.scrollY - window.innerHeight;
    window.scrollTo(0, Math.round(runway * p));
  }, p);

const state = (page) =>
  page.evaluate(() => {
    const peek = document.querySelector(".footer-peek");
    const inner = document.querySelector(".footer-peek__inner");
    const footer = document.querySelector("[data-site-footer]");
    const fr = footer.getBoundingClientRect();
    const atBottom = document.elementFromPoint(
      Math.round(window.innerWidth / 2),
      window.innerHeight - 8,
    );
    return {
      mode: document.documentElement.dataset.footerReveal,
      footerH: getComputedStyle(document.documentElement).getPropertyValue(
        "--footer-h",
      ),
      shown: peek?.dataset.shown ?? null,
      peekOpacity: inner ? getComputedStyle(inner).opacity : null,
      peekH: inner ? Math.round(inner.getBoundingClientRect().height) : null,
      peekInert: peek ? peek.hasAttribute("inert") : null,
      exit: peek ? peek.style.getPropertyValue("--peek-exit") : null,
      footerTop: Math.round(fr.top),
      footerBottom: Math.round(fr.bottom),
      bottomPixelIsFooter: Boolean(atBottom && footer.contains(atBottom)),
      bottomPixelTag: atBottom
        ? atBottom.tagName + "." + (atBottom.className?.baseVal ?? atBottom.className ?? "")
        : null,
      overflowX: document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      docH: document.documentElement.scrollHeight,
      vh: window.innerHeight,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    };
  });

/* ============================================ desktop, deterministic scroll */
{
  const [page, ctx] = await newPage({ width: 1440, height: 900, reduced: true });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);

  let s = await state(page);
  console.log("desktop 1440x900 @ top:", s);
  check(s.mode === "on", `desktop: reveal mode on (footer ${s.footerH})`);
  check(!s.bottomPixelIsFooter, "desktop @top: footer is covered by the page");
  check(s.shown === "false", "desktop @top: peek hidden");
  check(s.peekOpacity === "0", "desktop @top: peek opacity 0");
  check(s.peekInert === true, "desktop @top: peek is inert (not tabbable)");
  check(s.overflowX <= 0, `desktop: no horizontal overflow (${s.overflowX}px)`);
  check(
    s.peekH > 0 && s.peekH < s.vh * 0.12,
    `desktop: peek strip is shallow (${s.peekH}px of ${s.vh})`,
  );

  /* The reserved space has to be the footer's height and nothing more: the
     document must end up exactly as tall as it would be with the footer in
     normal flow, or turning the effect on at hydration would move the page
     under the reader. Measured as an identity rather than by toggling the
     attribute, which only measures the browser's invalidation timing. */
  const reserve = await page.evaluate(() => {
    const layer = document.querySelector("[data-page-layer]");
    return {
      doc: document.documentElement.scrollHeight,
      sum:
        layer.offsetHeight +
        Math.round(
          document.querySelector("[data-site-footer]").getBoundingClientRect()
            .height,
        ),
      dead: Math.round(parseFloat(getComputedStyle(layer).marginBottom)) -
        Math.round(
          document.querySelector("[data-site-footer]").getBoundingClientRect()
            .height,
        ),
    };
  });
  check(
    Math.abs(reserve.doc - reserve.sum) <= 2,
    `desktop: document is page + footer exactly (${reserve.doc} vs ${reserve.sum})`,
  );
  check(
    reserve.dead === 0,
    `desktop: reserved space equals footer height, no dead gap (${reserve.dead}px)`,
  );

  for (const [p, want] of [
    [0.3, "false"],
    [0.48, "false"],
    [0.55, "true"],
    [0.75, "true"],
    [0.4, "false"], // back up
    [0.9, "true"],
  ]) {
    await gotoProgress(page, p);
    await page.waitForTimeout(250);
    const st = await state(page);
    check(st.shown === want, `desktop: at ${p * 100}% progress peek=${st.shown} (want ${want})`);
  }

  // Hysteresis: sit exactly on the threshold and jitter around it.
  await gotoProgress(page, 0.5);
  await page.waitForTimeout(200);
  const onThreshold = await state(page);
  let flips = 0;
  let prev = onThreshold.shown;
  for (let i = 0; i < 12; i++) {
    await page.evaluate((d) => window.scrollBy(0, d), i % 2 ? -3 : 3);
    await page.waitForTimeout(60);
    const st = await state(page);
    if (st.shown !== prev) flips++;
    prev = st.shown;
  }
  check(flips <= 1, `desktop: no flicker on ±3px jitter at the threshold (${flips} flips)`);

  // Bottom of the page.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);
  s = await state(page);
  console.log("desktop @bottom:", s);
  check(s.bottomPixelIsFooter, "desktop @bottom: footer is the thing at the bottom edge");
  check(s.footerTop >= -1, `desktop @bottom: whole footer is on screen (top ${s.footerTop})`);
  check(
    Math.abs(s.footerBottom - s.vh) <= 1,
    `desktop @bottom: footer meets the viewport bottom (${s.footerBottom} / ${s.vh})`,
  );
  check(s.shown === "false", "desktop @bottom: peek has handed over");
  check(s.exit === "1.0000", `desktop @bottom: hand-off complete (exit ${s.exit})`);

  // Footer CTA must actually be clickable where revealed.
  const cta = page.locator('[data-site-footer] a[href="/contact"]');
  const hit = await cta.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return el.contains(top) || el === top;
  });
  check(hit, "desktop @bottom: footer 'Get in touch' is hit-testable");
  await cta.click();
  await page.waitForURL(/\/contact$/, { timeout: 5000 }).catch(() => {});
  check(/\/contact$/.test(page.url()), `desktop: footer CTA navigates to /contact (${page.url()})`);

  // /contact drops the pitch but keeps the reveal.
  await page.waitForTimeout(600);
  const contact = await page.evaluate(() => ({
    peek: document.querySelector(".footer-peek") !== null,
    pitch: document.querySelector("[data-site-footer]")?.textContent?.includes(
      "Want to work",
    ),
    mode: document.documentElement.dataset.footerReveal,
  }));
  check(contact.peek === false, "internal page (/contact): no peek strip in the DOM");
  check(contact.pitch === false, "/contact: footer pitch stays suppressed");

  await ctx.close();
}

/* ================================================= internal page behaviour */
{
  const [page, ctx] = await newPage({ width: 1440, height: 900, reduced: true });
  await page.goto(`${base}/about`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  let s = await state(page);
  check(s.shown === null, "/about: no peek element in the DOM");
  check(!s.bottomPixelIsFooter, "/about @top: footer covered");
  check(s.overflowX <= 0, `/about: no horizontal overflow (${s.overflowX}px)`);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);
  s = await state(page);
  check(s.bottomPixelIsFooter, "/about @bottom: footer revealed");
  check(s.footerTop >= -1, `/about @bottom: whole footer on screen (top ${s.footerTop})`);
  await ctx.close();
}

/* ==================================================== normal motion (Lenis) */
{
  const [page, ctx] = await newPage({ width: 1440, height: 900, reduced: false });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const start = await state(page);
  check(start.shown === "false", "lenis: peek hidden on landing");

  await page.mouse.move(720, 450);
  let sawPeek = false;
  for (let i = 0; i < 60; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(90);
    const st = await state(page);
    if (st.shown === "true") sawPeek = true;
    if (st.bottomPixelIsFooter && st.footerTop >= -1) break;
  }
  await page.waitForTimeout(600);
  const end = await state(page);
  check(sawPeek, "lenis: peek appeared during a real wheel scroll");
  check(end.bottomPixelIsFooter, "lenis: footer revealed at the bottom");
  check(end.overflowX <= 0, `lenis: no horizontal overflow (${end.overflowX}px)`);
  await ctx.close();
}

/* ============================================================ mobile 390px */
{
  const [page, ctx] = await newPage({ width: 390, height: 844, reduced: true });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
  let s = await state(page);
  console.log("mobile 390x844 @ top:", s);
  check(["on", "off"].includes(s.mode), `mobile: mode resolved (${s.mode}, footer ${s.footerH})`);
  check(!s.bottomPixelIsFooter, "mobile @top: footer covered");
  check(s.shown === "false", "mobile @top: peek hidden");
  check(s.overflowX <= 0, `mobile: no horizontal overflow (${s.overflowX}px)`);
  check(
    s.peekH > 0 && s.peekH < s.vh * 0.12,
    `mobile: peek is a shallow strip (${s.peekH}px of ${s.vh} = ${Math.round(
      (s.peekH / s.vh) * 100,
    )}%)`,
  );
  await gotoProgress(page, 0.55);
  await page.waitForTimeout(300);
  s = await state(page);
  check(s.shown === "true", "mobile: peek shows past halfway");
  const oneRow = await page.evaluate(() => {
    const row = document.querySelector(".footer-peek__inner > div");
    const [p, a] = [row.querySelector("p"), row.querySelector("a")];
    return Math.abs(
      p.getBoundingClientRect().top - a.getBoundingClientRect().top,
    ) < 24;
  });
  check(oneRow, "mobile: peek stays on one row (text left, button right)");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);
  s = await state(page);
  check(s.bottomPixelIsFooter, "mobile @bottom: footer revealed");
  check(s.shown === "false", "mobile @bottom: peek handed over");
  await ctx.close();
}

/* =============================================== tablet + laptop mode check */
for (const [w, h, label] of [
  [1024, 768, "tablet landscape"],
  [768, 1024, "tablet portrait"],
  [2560, 1440, "large desktop"],
  [1280, 720, "small laptop"],
]) {
  const [page, ctx] = await newPage({ width: w, height: h, reduced: true });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const s = await state(page);
  check(
    s.overflowX <= 0 && !s.bottomPixelIsFooter,
    `${label} ${w}x${h}: clean at rest (mode ${s.mode}, footer ${s.footerH}, overflowX ${s.overflowX})`,
  );
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);
  const b = await state(page);
  /* In the pinned mode the whole footer has to land on screen. In the fallback
     the footer is simply the end of a normal page, so a footer taller than the
     window ends with its top above the fold — which is what a page does. */
  const whole = b.mode === "on" ? b.footerTop >= -1 : true;
  check(
    b.bottomPixelIsFooter && whole && b.footerBottom <= b.vh + 1,
    `${label}: footer lands cleanly at the bottom in "${b.mode}" mode (top ${b.footerTop}, bottom ${b.footerBottom}/${b.vh})`,
  );
  await ctx.close();
}

/* ================================================ client-side route changes */
{
  const [page, ctx] = await newPage({ width: 1440, height: 900, reduced: true });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const home = await state(page);

  // Homepage -> internal -> contact -> back home, all client-side.
  await page.getByRole("link", { name: "Work", exact: true }).first().click();
  await page.waitForURL(/\/work$/, { timeout: 5000 });
  await page.waitForTimeout(700);
  const work = await state(page);
  check(work.shown === null, "route change: peek is gone on /work");
  check(
    work.mode === "on" && !work.bottomPixelIsFooter,
    `route change: /work keeps the reveal (${work.mode}, footer ${work.footerH})`,
  );

  await page.goto(`${base}/contact`, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const contact = await page.evaluate(() => {
    const layer = document.querySelector("[data-page-layer]");
    const footer = document.querySelector("[data-site-footer]");
    return {
      margin: Math.round(parseFloat(getComputedStyle(layer).marginBottom)),
      height: Math.round(footer.getBoundingClientRect().height),
      covered: !footer.contains(
        document.elementFromPoint(innerWidth / 2, innerHeight - 8),
      ),
    };
  });
  /* The pitch is a cell of the link grid, so dropping it on /contact does not
     change the row's height — the reserve is the same on both. What matters is
     that whatever the footer measures, the reserve tracks it exactly. */
  check(
    contact.margin === contact.height,
    `route change: /contact reserve tracks its own footer (${contact.margin} = ${contact.height})`,
  );
  check(contact.covered, "route change: /contact footer still covered at the top");

  await page.getByRole("link", { name: "puzzle — home" }).first().click();
  await page.waitForURL(new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`), { timeout: 5000 });
  await page.waitForTimeout(900);
  const back = await state(page);
  check(back.shown === "false", "route change: back home, peek starts hidden again");
  check(
    back.footerH === home.footerH,
    `route change: footer height back to the homepage's (${back.footerH})`,
  );
  check(back.overflowX <= 0, "route change: no overflow after navigating");
  await ctx.close();
}

/* ============================================= keyboard + colour contrast */
{
  const [page, ctx] = await newPage({ width: 1440, height: 900, reduced: true });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);

  const focusPeek = () =>
    page.evaluate(() => {
      const link = document.querySelector(".footer-peek a");
      link.focus();
      return document.activeElement === link;
    });

  check(!(await focusPeek()), "hidden peek: its link cannot take focus");

  await gotoProgress(page, 0.65);
  await page.waitForTimeout(300);
  check(await focusPeek(), "shown peek: its link takes focus");
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/contact$/, { timeout: 5000 }).catch(() => {});
  check(
    /\/contact$/.test(page.url()),
    `shown peek: Enter follows the link (${page.url()})`,
  );

  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(600);
  await gotoProgress(page, 0.65);
  await page.waitForTimeout(300);

  /* Blue is a light colour and white on it is 2.6:1 — the reason the whole
     footer is set in ink. Assert it rather than trust it. */
  const contrast = await page.evaluate(() => {
    /* The token layer mixes in oklab, so several of these compute to
       `oklab(...)` rather than `rgb(...)`. Painting each one into a canvas and
       reading the pixel back makes the browser do the conversion — parsing the
       string as if it were sRGB reads the lightness as a red channel and
       reports nonsense. */
    const surface = document.createElement("canvas");
    surface.width = surface.height = 1;
    const pen = surface.getContext("2d", { willReadFrequently: true });
    const lum = (c) => {
      pen.clearRect(0, 0, 1, 1);
      pen.fillStyle = c;
      pen.fillRect(0, 0, 1, 1);
      const [r, g, b] = [...pen.getImageData(0, 0, 1, 1).data].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const footer = document.querySelector("[data-site-footer]");
    const bg = getComputedStyle(footer).backgroundColor;
    const pick = (sel) => getComputedStyle(footer.querySelector(sel)).color;
    return {
      bg,
      heading: ratio(bg, pick(".display")),
      link: ratio(bg, pick("ul a")),
      label: ratio(bg, pick(".mono")),
      peek: ratio(
        getComputedStyle(document.querySelector(".footer-peek__inner"))
          .backgroundColor,
        getComputedStyle(document.querySelector(".footer-peek p")).color,
      ),
    };
  });
  const r2 = (n) => Math.round(n * 100) / 100;
  check(contrast.heading >= 4.5, `footer heading contrast ${r2(contrast.heading)}:1 on ${contrast.bg}`);
  check(contrast.link >= 4.5, `footer link contrast ${r2(contrast.link)}:1`);
  check(contrast.label >= 4.5, `footer label contrast ${r2(contrast.label)}:1`);
  check(contrast.peek >= 4.5, `peek text contrast ${r2(contrast.peek)}:1`);
  await ctx.close();
}

/* ======================================= mode flipping under a live resize */
{
  const [page, ctx] = await newPage({ width: 1440, height: 900, reduced: true });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const seen = new Set();
  for (const [w, h] of [
    [1280, 560],
    [1440, 900],
    [900, 500],
    [1920, 1080],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(450);
    const r = await page.evaluate(() => {
      const layer = document.querySelector("[data-page-layer]");
      const footer = document.querySelector("[data-site-footer]");
      const mode = document.documentElement.dataset.footerReveal;
      const margin = Math.round(parseFloat(getComputedStyle(layer).marginBottom));
      const fh = Math.round(footer.getBoundingClientRect().height);
      // In flow, the footer must start exactly where the page ends.
      const y = window.scrollY;
      const gap =
        mode === "on"
          ? 0
          : Math.round(
              footer.getBoundingClientRect().top +
                y -
                (layer.getBoundingClientRect().bottom + y),
            );
      return { mode, ok: mode === "on" ? margin === fh : margin === 0 && gap === 0 };
    });
    seen.add(r.mode);
    check(r.ok, `resize ${w}x${h}: settles clean in "${r.mode}" mode`);
  }
  check(seen.size === 2, `resize: both modes exercised (${[...seen].join(", ")})`);
  await ctx.close();
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
