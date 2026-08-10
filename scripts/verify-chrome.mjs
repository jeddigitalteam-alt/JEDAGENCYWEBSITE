/**
 * Dev-only: the site chrome — route transition, navigation split, footer marks
 * and the absence of the custom cursor.
 *
 * Usage: node scripts/verify-chrome.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const pass = [];
const fail = [];
const check = (ok, label) => (ok ? pass : fail).push(label);

async function newPage({ width = 1440, height = 900, reduced = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("puzzle:intro-seen", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return [page, ctx, errors];
}

/** The transition layer's live geometry, or null when it is not mounted. */
const sheet = (page) =>
  page.evaluate(() => {
    const el = document.querySelector(".fixed.inset-0.z-\\[110\\]");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top),
      covers: r.top <= 1 && r.bottom >= window.innerHeight - 1,
      bg: getComputedStyle(el).backgroundColor,
      z: getComputedStyle(el).zIndex,
    };
  });

/* ======================================================= the transition runs */
{
  const [page, ctx, errors] = await newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(800);

  check((await sheet(page)) === null, "at rest: no transition layer in the DOM");

  /* Record the sheet every animation frame from inside the page. Polling from
     the test runner samples at ~30ms with a round trip on top, which is enough
     to miss the commit frame entirely and makes the central assertion here — 
     that the route changes only while the viewport is covered — a coin flip. */
  await page.evaluate(() => {
    window.__frames = [];
    const tick = () => {
      const el = document.querySelector("[data-route-transition]");
      const r = el?.getBoundingClientRect();
      const wrap = el?.parentElement;
      const markBox = wrap?.querySelector(".grid");
      const svg = wrap?.querySelector("svg");
      const piece = svg?.querySelector("g");
      const tx = /translateX\(([-\d.]+)px\)/.exec(piece?.style.transform ?? "");
      window.__frames.push({
        path: location.pathname,
        top: r ? Math.round(r.top) : null,
        bottom: r ? Math.round(r.bottom) : null,
        vh: window.innerHeight,
        // The mark: how visible it is, how far apart the pieces are, its size.
        markOpacity: markBox
          ? Math.round(parseFloat(getComputedStyle(markBox).opacity) * 100) / 100
          : null,
        markW: svg ? Math.round(svg.getBoundingClientRect().width) : null,
        markStroke: svg ? getComputedStyle(svg).stroke : null,
        apart: tx ? Math.abs(parseFloat(tx[1])) : null,
      });
      window.__raf = requestAnimationFrame(tick);
    };
    tick();
  });

  const start = Date.now();
  await page.getByRole("link", { name: "About", exact: true }).first().click();
  await page.waitForURL(/\/about$/, { timeout: 8000 });
  await page.waitForFunction(
    () => !document.querySelector("[data-route-transition]"),
    null,
    { timeout: 8000 },
  );
  const total = Date.now() - start;
  const frames = await page.evaluate(() => {
    cancelAnimationFrame(window.__raf);
    return window.__frames;
  });

  const mounted = frames.filter((f) => f.top !== null);
  const covers = (f) => f.top <= 2 && f.bottom >= f.vh - 2;
  const firstOnNewRoute = frames.find((f) => f.path === "/about");

  check(
    mounted.some(covers),
    "transition: the sheet fully covers the viewport at some point",
  );
  check(
    Boolean(firstOnNewRoute) && covers(firstOnNewRoute),
    `transition: the route only commits while the viewport is covered (sheet at ${firstOnNewRoute?.top} on the commit frame)`,
  );
  check(
    mounted.some((f) => f.top > 2),
    "transition: the sheet rises into place (it travels, not fades)",
  );
  check(
    mounted.some((f) => f.path === "/about" && f.top < -2),
    "transition: the sheet carries on upward after the commit (one direction)",
  );
  // Never reverses: the top only ever decreases once it has covered.
  const afterCover = mounted.slice(mounted.findIndex(covers));
  check(
    afterCover.every((f, i) => i === 0 || f.top <= afterCover[i - 1].top + 2),
    "transition: the sheet never changes direction mid-move",
  );
  /* 800 cover + 100 covered + 900 reveal, plus the commit and a frame or two of
     scheduling. Bounded on both sides: too fast means the durations were lost,
     too slow means something is waiting on more than the route. */
  check(
    total > 1600 && total < 2300,
    `transition: whole move is ~1.8s (${total}ms observed)`,
  );

  /* ---- the mark: the pieces have to be SEEN to connect -------------------
     Not "did they end up seated" — they always do. The question is whether the
     travel happens while anyone can see it. The first cut of this ran the fade
     and the close together and, because the lock curve is expo-out, the pieces
     were 90% closed before the mark reached full opacity: a connect animation
     that played entirely behind a fade. */
  const marked = mounted.filter((f) => f.apart !== null);
  const visiblyApart = marked.filter((f) => f.markOpacity >= 0.95 && f.apart > 40);
  const visiblyClosing = marked.filter(
    (f) => f.markOpacity >= 0.95 && f.apart > 2 && f.apart < 130,
  );
  const seatedWhileCovered = marked.find(
    (f) => f.apart < 1 && f.markOpacity >= 0.95 && covers(f),
  );
  check(
    visiblyApart.length >= 2,
    `mark: pieces are fully visible while still apart (${visiblyApart.length} frames)`,
  );
  check(
    visiblyClosing.length >= 5,
    `mark: the close is visible at full opacity (${visiblyClosing.length} frames of travel)`,
  );
  check(
    Boolean(seatedWhileCovered),
    "mark: pieces seat together while the screen is still covered",
  );
  const parted = frames.filter(
    (f) => f.path === "/about" && f.apart !== null && f.apart > 2,
  );
  check(
    parted.length > 0,
    `mark: pieces part again as the sheet leaves (${parted.length} frames)`,
  );
  const gone = frames.find(
    (f) => f.path === "/about" && f.markOpacity !== null && f.markOpacity < 0.02,
  );
  check(
    Boolean(gone) && gone.bottom > gone.vh / 2,
    `mark: it is gone before the middle of the screen is uncovered (sheet bottom ${gone?.bottom} of ${gone?.vh})`,
  );
  const widths = [...new Set(marked.map((f) => f.markW))];
  check(
    widths.length === 1 && widths[0] === 96,
    `mark: rendered at 96px — 1.5x the 64px it was (${widths.join(", ")})`,
  );
  check(
    marked[0].markStroke === "rgb(255, 255, 255)",
    `mark: white on the blue (${marked[0].markStroke})`,
  );
  check(
    page.url().endsWith("/about"),
    `transition: navigation actually happened (${page.url()})`,
  );
  check((await sheet(page)) === null, "transition: layer is unmounted afterwards");

  const colour = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue("--blue").trim(),
  );
  check(colour === "#12a8ff", `transition: uses the brand blue token (${colour})`);
  check(errors.length === 0, `transition: no console errors (${errors.join(" | ")})`);
  await ctx.close();
}

/* ================================================ what must NOT be intercepted
   Asks the page directly whether the transition claimed a click, without ever
   letting the click reach the browser. The probe listens in the capture phase
   on `document`, so it runs immediately after the transition's own listener on
   the same node — late enough to read its verdict, early enough to cancel the
   event before anything acts on it. */
const CLAIM_PROBE = `
  (selector, init) => {
    const a = typeof selector === "string"
      ? document.querySelector(selector)
      : selector;
    if (!a) return { missing: true };
    let claimed = null;
    const probe = (e) => {
      claimed = e.defaultPrevented;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    document.addEventListener("click", probe, true);
    a.dispatchEvent(new MouseEvent("click", {
      bubbles: true, cancelable: true, button: 0, ...init,
    }));
    document.removeEventListener("click", probe, true);
    return { claimed, href: a.getAttribute("href") };
  }
`;
{
  const [page, ctx] = await newPage();
  await page.goto(`${base}/contact`, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const claim = (selector, init = {}) =>
    page.evaluate(
      ([src, sel, opts]) => eval(src)(sel, opts),
      [CLAIM_PROBE, selector, init],
    );

  const mailto = await claim('[data-site-footer] a[href^="mailto:"]');
  check(mailto.claimed === false, `mailto link is left alone (${mailto.href})`);

  const external = await claim('[data-site-footer] a[target="_blank"]');
  check(
    external.claimed === false,
    `external new-tab link is left alone (${external.href})`,
  );

  const modified = await claim('a[href="/about"]', { metaKey: true });
  check(
    modified.claimed === false,
    "cmd/ctrl-click on an internal link is left to the browser",
  );

  const internal = await claim('a[href="/about"]');
  check(internal.claimed === true, "plain internal link IS intercepted");

  // Same-page hash, on the page that owns the anchor.
  await page.goto(`${base}/work`, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const hash = await page.evaluate(
    ([src]) => {
      const a = document.createElement("a");
      a.href = "/work#how-we-work";
      document.body.appendChild(a);
      const out = eval(src)(a, {});
      a.remove();
      return out;
    },
    [CLAIM_PROBE],
  );
  check(hash.claimed === false, "same-page anchor link is left alone");

  // A cross-page link TO an anchor is still a navigation, so it is claimed.
  const crossHash = await claim('a[href="/services"]');
  check(crossHash.claimed === true, "cross-page link is claimed");
  await ctx.close();
}

/* ============================ a query-string change is not a page change ---
   The reveal waits on `usePathname`, which a search-only push never changes,
   so claiming one would leave the sheet up until the safety timeout. The
   scope handover from /services to /contact is exactly this shape. */
{
  const [page, ctx] = await newPage();
  await page.goto(`${base}/contact?scope=web-design`, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const samePathQuery = await page.evaluate(
    ([src]) => {
      const a = document.createElement("a");
      a.href = "/contact?scope=brand-identity";
      document.body.appendChild(a);
      const out = eval(src)(a, {});
      a.remove();
      return out;
    },
    [CLAIM_PROBE],
  );
  check(
    samePathQuery.claimed === false,
    "same-path query change is left alone (no sheet waiting on a path that cannot change)",
  );

  // And the real handover still works end to end.
  await page.goto(`${base}/services`, { waitUntil: "load" });
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "+ Brand identity" }).click();
  await page.waitForTimeout(500);
  await page.locator("button", { hasText: "Send this scope" }).first().click();
  await page.waitForURL(/\/contact\?/, { timeout: 8000 }).catch(() => {});
  check(
    page.url().includes("scope="),
    `scope handover still reaches /contact with params (${page.url()})`,
  );
  await page.waitForTimeout(900);
  check(
    (await sheet(page)) === null,
    "scope handover leaves no transition layer behind",
  );
  await ctx.close();
}

/* ============================================== back/forward and double clicks */
{
  const [page, ctx, errors] = await newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.getByRole("link", { name: "Labs", exact: true }).first().click();
  await page.waitForURL(/\/labs$/, { timeout: 6000 });
  await page.waitForTimeout(1200);

  await page.goBack();
  await page.waitForTimeout(1000);
  check(
    new URL(page.url()).pathname === "/",
    `back button returns home (${page.url()})`,
  );
  check((await sheet(page)) === null, "back/forward: no stuck transition layer");
  const heroVisible = await page.evaluate(() => {
    const h = document.querySelector("h1");
    return h ? getComputedStyle(h).opacity : "none";
  });
  check(
    heroVisible !== "0",
    `back/forward: the arriving page is not left veiled (h1 opacity ${heroVisible})`,
  );

  await page.goForward();
  await page.waitForTimeout(900);
  check(/\/labs$/.test(page.url()), "forward button works");

  /* Hammer a link: only one transition may run. Counted by watching the layer
     mount rather than by waiting a fixed time and then looking — a fixed wait
     only ever tests the duration it was calibrated against, and says nothing
     about whether a second sheet ran inside it. */
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    window.__mounts = 0;
    window.__watch = new MutationObserver((records) => {
      for (const r of records) {
        for (const n of r.addedNodes) {
          // The layer is a child of the wrapper React mounts, so the added
          // node is the wrapper — match either.
          if (
            n.nodeType === 1 &&
            (n.matches?.("[data-route-transition]") ||
              n.querySelector?.("[data-route-transition]"))
          ) {
            window.__mounts++;
          }
        }
      }
    });
    window.__watch.observe(document.body, { childList: true, subtree: true });
  });
  const link = page.getByRole("link", { name: "Articles", exact: true }).first();
  await link.click();
  await link.click({ force: true }).catch(() => {});
  await link.click({ force: true }).catch(() => {});
  await page.waitForFunction(
    () => !document.querySelector("[data-route-transition]"),
    null,
    { timeout: 8000 },
  );
  const mounts = await page.evaluate(() => {
    window.__watch.disconnect();
    return window.__mounts;
  });
  const layers = await page.evaluate(
    () => document.querySelectorAll("[data-route-transition]").length,
  );
  check(mounts === 1, `rapid clicks run exactly one transition (${mounts} mounted)`);
  check(layers === 0, `rapid clicks leave no layer behind (${layers})`);
  check(/\/articles$/.test(page.url()), `rapid clicks navigate once (${page.url()})`);
  check(errors.length === 0, `no console errors (${errors.join(" | ")})`);
  await ctx.close();
}

/* ============================================================ reduced motion */
{
  const [page, ctx] = await newPage({ reduced: true });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const tops = [];
  const t0 = Date.now();
  await page.getByRole("link", { name: "About", exact: true }).first().click();
  for (let i = 0; i < 20; i++) {
    const s = await page.evaluate(() => {
      /* The sheet, not the wrapper around it. Targeting the wrapper made the
         "never travels" assertion pass for the wrong reason — a full-screen
         static box never travels. */
      const el = document.querySelector("[data-route-transition]");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const g = el.parentElement?.querySelector("svg g");
      const tx = /translateX\(([-\d.]+)px\)/.exec(g?.style.transform ?? "");
      return {
        top: Math.round(r.top),
        opacity: getComputedStyle(el).opacity,
        apart: tx ? Math.abs(parseFloat(tx[1])) : g ? 0 : null,
      };
    });
    if (s) tops.push(s);
    if (!s && Date.now() - t0 > 200) break;
    await page.waitForTimeout(25);
  }
  const elapsed = Date.now() - t0;
  check(
    tops.every((s) => s.top === 0),
    "reduced motion: the sheet never travels (fade only)",
  );
  check(
    tops.some((s) => Number(s.opacity) > 0 && Number(s.opacity) < 1),
    "reduced motion: it cross-fades rather than snapping",
  );
  check(elapsed < 900, `reduced motion: much shorter (${elapsed}ms)`);
  check(page.url().endsWith("/about"), "reduced motion: still navigates");
  check(
    tops.every((s) => s.apart !== null && s.apart < 1),
    `reduced motion: the mark is shown seated, never assembled (max separation ${Math.max(0, ...tops.map((s) => s.apart ?? 0))})`,
  );
  await ctx.close();
}

/* ================================================= navigation: Services split */
{
  const [page, ctx] = await newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);

  const top = await page.$$eval("header nav a, header nav button", (els) =>
    els.map((e) => e.textContent.trim()),
  );
  check(top.includes("Services"), `header has Services (${top.join(", ")})`);
  check(top.includes("Industries"), "header has Industries as a top-level item");

  await page.getByRole("button", { name: "Services", exact: true }).hover();
  await page.waitForTimeout(450);
  const servicesPanel = await page.evaluate(() => {
    const panel = document.querySelector('[id^="nav-panel-services"]');
    if (!panel) return null;
    return {
      headings: [...panel.querySelectorAll("p.mono")].map((p) => p.textContent.trim()),
      services: panel.querySelectorAll('a[href^="/services/"]').length,
      industries: panel.querySelectorAll('a[href^="/industries/"]').length,
    };
  });
  check(servicesPanel?.services > 0, `Services panel lists services (${servicesPanel?.services})`);
  check(
    servicesPanel?.industries === 0,
    `Services panel no longer carries industries (${servicesPanel?.industries})`,
  );
  check(
    servicesPanel?.headings.join(",") === "Services",
    `Services panel has one heading (${servicesPanel?.headings.join(", ")})`,
  );

  await page.getByRole("button", { name: "Industries", exact: true }).hover();
  await page.waitForTimeout(450);
  const industriesPanel = await page.evaluate(() => {
    const panel = document.querySelector('[id^="nav-panel-industries"]');
    if (!panel) return null;
    return {
      industries: panel.querySelectorAll('a[href^="/industries/"]').length,
      services: panel.querySelectorAll('a[href^="/services/"]').length,
    };
  });
  check(
    industriesPanel?.industries > 0,
    `Industries panel lists industries (${industriesPanel?.industries})`,
  );
  check(
    industriesPanel?.services === 0,
    "Industries panel carries no services (no duplication)",
  );

  /* The hover bridge: the pointer has to be able to travel from the trigger
     into the panel without the panel closing on the way. */
  const trigger = await page
    .getByRole("button", { name: "Industries", exact: true })
    .boundingBox();
  await page.mouse.move(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2);
  await page.waitForTimeout(300);
  const panelBox = await page.locator('[id^="nav-panel-industries"]').boundingBox();
  // Step down through the gap between the trigger and the panel body.
  for (let y = trigger.y + trigger.height; y <= panelBox.y + 40; y += 4) {
    await page.mouse.move(panelBox.x + panelBox.width / 2, y);
  }
  await page.waitForTimeout(250);
  const stillOpen = await page.locator('[id^="nav-panel-industries"]').count();
  check(stillOpen === 1, "Industries panel survives the trip from trigger to panel");

  const firstIndustry = page
    .locator('[id^="nav-panel-industries"] a[href^="/industries/"]')
    .first();
  const href = await firstIndustry.getAttribute("href");
  await firstIndustry.click();
  await page.waitForURL(new RegExp(href.replace(/\//g, "\\/") + "$"), { timeout: 6000 });
  check(page.url().endsWith(href), `Industries panel links still resolve (${href})`);
  await ctx.close();
}

/* ===================================================== mobile / tablet nav */
for (const [w, h, label] of [
  [390, 844, "mobile"],
  [820, 1180, "tablet"],
]) {
  const [page, ctx] = await newPage({ width: w, height: h });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const menu = page.getByRole("button", { name: "Menu" });
  check(await menu.isVisible(), `${label}: Menu button is the navigation`);
  await menu.click();
  await page.waitForTimeout(400);
  await page.getByLabel("Search pages").fill("industries");
  await page.waitForTimeout(250);
  const hits = await page.$$eval("#palette-results button", (b) =>
    b.map((x) => x.textContent),
  );
  check(
    hits.some((t) => t.includes("/industries")),
    `${label}: industries reachable from the palette (${hits.length} hits)`,
  );
  await page.locator("#palette-results button").first().click();
  await page.waitForTimeout(1400);
  check(
    /\/industries/.test(page.url()),
    `${label}: palette navigates through the transition (${page.url()})`,
  );
  const noOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  check(noOverflow <= 0, `${label}: no horizontal overflow (${noOverflow}px)`);
  await ctx.close();
}

/* ========================================================= footer + cursor */
{
  const [page, ctx] = await newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(700);

  const cursor = await page.evaluate(() => ({
    flag: document.body.dataset.customCursor ?? null,
    label: document.body.getAttribute("data-cursor"),
    labelled: document.querySelectorAll("[data-cursor]").length,
    bodyCursor: getComputedStyle(document.body).cursor,
    linkCursor: getComputedStyle(document.querySelector("header a")).cursor,
  }));
  check(cursor.flag === null, "cursor: no data-custom-cursor flag on <body>");
  check(cursor.labelled === 0, `cursor: no data-cursor labels left (${cursor.labelled})`);
  check(cursor.bodyCursor !== "none", `cursor: body uses the native cursor (${cursor.bodyCursor})`);
  check(
    cursor.linkCursor === "pointer",
    `cursor: links get the pointer (${cursor.linkCursor})`,
  );
  const svgCount = await page.evaluate(
    () => document.querySelectorAll("svg.pointer-events-none.fixed").length,
  );
  check(svgCount === 0, `cursor: no follower element left in the DOM (${svgCount})`);

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await page.waitForTimeout(600);

  const social = await page.evaluate(() => {
    const links = [
      ...document.querySelectorAll('[data-site-footer] a[target="_blank"]'),
    ];
    return links.map((a) => ({
      label: a.getAttribute("aria-label"),
      href: a.getAttribute("href"),
      text: a.textContent.trim(),
      svg: a.querySelectorAll("svg").length,
      size: Math.round(a.querySelector("svg")?.getBoundingClientRect().width ?? 0),
      tap: Math.round(a.getBoundingClientRect().height),
    }));
  });
  check(social.length === 2, `footer: two social links (${social.length})`);
  check(
    social.every((s) => s.svg === 1 && s.text === ""),
    "footer: social links are icons, not text",
  );
  check(
    social.map((s) => s.label).join(",") === "Instagram,LinkedIn",
    `footer: aria-labels are the names (${social.map((s) => s.label).join(", ")})`,
  );
  check(
    social.every((s) => /instagram|linkedin/.test(s.href)),
    `footer: URLs preserved (${social.map((s) => s.href).join(", ")})`,
  );
  check(
    social.every((s) => s.size >= 16 && s.size <= 28),
    `footer: icons are a restrained size (${social.map((s) => s.size).join(", ")}px)`,
  );
  check(
    social.every((s) => s.tap >= 40),
    `footer: tap targets stay large (${social.map((s) => s.tap).join(", ")}px)`,
  );

  // Focus ring survives.
  await page.evaluate(() =>
    document.querySelector('[data-site-footer] a[target="_blank"]').focus(),
  );
  const ring = await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement);
    return { w: cs.outlineWidth, style: cs.outlineStyle, colour: cs.outlineColor };
  });
  check(
    ring.style !== "none" && parseFloat(ring.w) > 0,
    `footer: social icons keep a visible focus ring (${ring.w} ${ring.style})`,
  );

  const mark = await page.evaluate(() => {
    const footer = document.querySelector("[data-site-footer]");
    const path = footer.querySelector("svg path[stroke]");
    const word = [...footer.querySelectorAll(".wordmark")].pop();
    const toRGB = (c) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 1;
      const g = cv.getContext("2d");
      g.fillStyle = c;
      g.fillRect(0, 0, 1, 1);
      return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3).join(",");
    };
    return {
      stroke: toRGB(getComputedStyle(path).stroke),
      fill: toRGB(getComputedStyle(path).fill),
      word: toRGB(getComputedStyle(word).color),
      field: toRGB(getComputedStyle(footer).backgroundColor),
    };
  });
  check(mark.stroke === "255,255,255", `footer mark: keyline is white (${mark.stroke})`);
  check(
    mark.fill === mark.field,
    `footer mark: piece is filled with the footer blue (${mark.fill} vs field ${mark.field})`,
  );
  check(mark.word === "255,255,255", `footer wordmark: white (${mark.word})`);

  // The header's mark must be untouched by the footer variant.
  const header = await page.evaluate(() => {
    const p = document.querySelector("header svg path[stroke]");
    const cs = getComputedStyle(p);
    return { stroke: cs.stroke, fill: cs.fill };
  });
  check(
    header.fill.includes("54, 182, 254") || header.fill === "rgb(54, 182, 254)",
    `header mark keeps the artwork blue (${header.fill})`,
  );
  await ctx.close();
}

/* ================================ the intro loader still runs unchanged ----
   The connect gesture was lifted out of IntroLoader so the route transition
   could play it rather than carry a copy. The loader is the older and more
   fragile of the two — its artwork is frozen — so it gets a regression check
   here rather than trust. No seeded sessionStorage: the intro runs once per
   session and a warmed context silently skips it, which would leave this
   asserting nothing while appearing to pass. */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.addInitScript(() => {
    window.__loader = [];
    const wait = () => {
      const svg = document.querySelector('svg[aria-label="Puzzle"]');
      if (!svg) return requestAnimationFrame(wait);
      const t0 = performance.now();
      const tick = () => {
        const live = document.querySelector('svg[aria-label="Puzzle"]');
        const g = live?.querySelector("g");
        const tx = /translateX\(([-\d.]+)px\)/.exec(g?.style.transform ?? "");
        window.__loader.push({
          t: Math.round(performance.now() - t0),
          present: Boolean(live),
          x: tx ? parseFloat(tx[1]) : null,
          dash: g ? getComputedStyle(g.querySelector("path")).strokeDasharray : null,
        });
        window.__lraf = requestAnimationFrame(tick);
      };
      tick();
    };
    requestAnimationFrame(wait);
  });
  await page.goto(base, { waitUntil: "commit" });
  const appeared = await page
    .waitForSelector('svg[aria-label="Puzzle"]', { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  check(appeared, "intro loader: still renders on a fresh session");

  const geom = await page.evaluate(() => {
    const svg = document.querySelector('svg[aria-label="Puzzle"]');
    return {
      viewBox: svg.getAttribute("viewBox"),
      cls: svg.getAttribute("class"),
      strokeWidth: svg.getAttribute("stroke-width"),
      stroke: getComputedStyle(svg).stroke,
      paths: svg.querySelectorAll("path").length,
      width: Math.round(svg.getBoundingClientRect().width),
    };
  });
  check(
    geom.viewBox === "0 0 1000 1000" &&
      geom.cls === "w-[min(52vw,30rem)] text-blue" &&
      geom.strokeWidth === "7" &&
      geom.paths === 2,
    `intro loader: markup unchanged by the extraction (${geom.cls}, sw ${geom.strokeWidth}, ${geom.paths} paths)`,
  );
  check(
    geom.stroke === "rgb(18, 168, 255)" && geom.width === 480,
    `intro loader: still blue at 480px (${geom.stroke}, ${geom.width}px)`,
  );

  await page.waitForTimeout(3200);
  const track = await page.evaluate(() => {
    cancelAnimationFrame(window.__lraf);
    return window.__loader;
  });
  const started = track.find((f) => f.x !== null);
  const landed = track.find((f) => f.x !== null && Math.abs(f.x) < 0.5);
  const removed = track.find((f) => !f.present);
  const drew = track.some((f) => f.dash && f.dash !== "none" && f.dash !== "0px");
  check(
    Boolean(started) && Math.abs(started.x - 63.64) < 0.5,
    `intro loader: pieces still start 63.64 units apart (${started?.x})`,
  );
  check(drew, "intro loader: outlines still stroke-draw");
  check(
    Boolean(landed) && landed.t > 1000 && landed.t < 1900,
    `intro loader: lock still lands around 1.6s (${landed?.t}ms)`,
  );
  check(
    Boolean(removed) && removed.t > 2200 && removed.t < 2900,
    `intro loader: still clears around 2.4s (${removed?.t}ms)`,
  );
  check(errors.length === 0, `intro loader: no errors (${errors.join(" | ")})`);
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
