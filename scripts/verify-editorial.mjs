/**
 * Dev-only: the editorial surfaces — the blue work section, the two quotes that
 * have to be one system, and the articles page.
 *
 * Usage: node scripts/verify-editorial.mjs [baseUrl]
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
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return [page, ctx, errors];
}

/** Contrast helper, injected into the page — the tokens compute to oklab(). */
const CONTRAST = `
  (() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const pen = cv.getContext("2d", { willReadFrequently: true });
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
    return (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
    };
  })()
`;

/* ==================================== 1. the Levant work section, in blue */
{
  const [page, ctx, errors] = await newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(1200);

  const field = await page.evaluate(
    ([contrastSrc]) => {
      const ratio = eval(contrastSrc);
      const section = document.querySelector("[data-blue]");
      if (!section) return null;
      const footer = document.querySelector("[data-site-footer]");
      const bg = getComputedStyle(section).backgroundColor;
      const at = (sel) => {
        const el = section.querySelector(sel);
        return el ? getComputedStyle(el).color : null;
      };
      return {
        bg,
        footerBg: getComputedStyle(footer).backgroundColor,
        token: getComputedStyle(document.documentElement)
          .getPropertyValue("--blue")
          .trim(),
        // Does the section actually contain the Levant tile?
        heading: section.querySelector("h2")?.textContent,
        tileTitle: section.querySelector("h3")?.textContent,
        eyebrowContrast: ratio(bg, at("p.mono")),
        headingContrast: ratio(bg, at("h2")),
        tileTitleContrast: ratio(bg, at("h3")),
        summaryContrast: ratio(bg, at("p:not(.mono)")),
        pillContrast: ratio(bg, at('a[href="/work"]')),
        // The hover accent must not be the field it sits on.
        accent: getComputedStyle(section).getPropertyValue("--accent").trim(),
        width: Math.round(section.getBoundingClientRect().width),
        viewport: window.innerWidth,
      };
    },
    [CONTRAST],
  );

  check(Boolean(field), "work section: the blue field exists");
  check(
    field.bg === field.footerBg,
    `work section: background is the exact footer blue (${field.bg} vs ${field.footerBg})`,
  );
  check(
    field.token === "#12a8ff",
    `work section: that is the --blue token (${field.token})`,
  );
  check(
    /Recent/.test(field.heading ?? "") && /LEVANT/i.test(field.tileTitle ?? ""),
    `work section: still the Levant "Recent work" tile (${field.heading} / ${field.tileTitle})`,
  );
  check(
    field.width === field.viewport,
    `work section: full-bleed (${field.width} of ${field.viewport})`,
  );
  for (const [name, r] of [
    ["eyebrow", field.eyebrowContrast],
    ["heading", field.headingContrast],
    ["tile title", field.tileTitleContrast],
    ["summary", field.summaryContrast],
    ["pill", field.pillContrast],
  ]) {
    check(r >= 4.5, `work section: ${name} contrast ${r}:1 on the blue`);
  }
  check(
    field.accent !== "" && field.accent !== "var(--blue)",
    `work section: hover accent is not the field itself (${field.accent})`,
  );

  // The hover must actually change the tile title's colour.
  const hover = await page.evaluate(() => {
    const h3 = document.querySelector("[data-blue] h3");
    return getComputedStyle(h3).color;
  });
  await page.locator("[data-blue] a.group").first().hover();
  await page.waitForTimeout(400);
  const hovered = await page.evaluate(() => {
    const h3 = document.querySelector("[data-blue] h3");
    return getComputedStyle(h3).color;
  });
  check(
    hover !== hovered,
    `work section: the tile title still changes on hover (${hover} to ${hovered})`,
  );
  check(errors.length === 0, `work section: no console errors (${errors.join(" | ")})`);
  await ctx.close();
}

/* ================================ 2. the two quotes have to be one system */
{
  const [page, ctx] = await newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(1200);

  const quotes = await page.evaluate(() => {
    const blocks = [...document.querySelectorAll("blockquote")];
    return blocks.map((b) => {
      const section = b.closest("section");
      const wrap = b.parentElement;
      const stars = wrap.querySelectorAll("svg");
      const meta = [...wrap.querySelectorAll("p")].filter(
        (p) => !p.classList.contains("sr-only"),
      );
      const cs = (el) => (el ? getComputedStyle(el) : null);
      const q = cs(b.querySelector("p"));
      return {
        heading: section.querySelector("h2")?.textContent ?? null,
        eyebrow: section.querySelector("p.mono")?.textContent ?? null,
        text: b.textContent.trim().slice(0, 40),
        quoteSize: q.fontSize,
        quoteFamily: q.fontFamily.split(",")[0],
        quoteLeading: q.lineHeight,
        starCount: stars.length,
        starColour: stars.length ? getComputedStyle(stars[0]).fill : null,
        srLabel: wrap.querySelector(".sr-only")?.textContent ?? null,
        // The last two <p> are company then attribution.
        companySize: cs(meta.at(-2))?.fontSize,
        attributionSize: cs(meta.at(-1))?.fontSize,
        company: meta.at(-2)?.textContent,
        attribution: meta.at(-1)?.textContent,
      };
    });
  });

  check(quotes.length === 2, `two quotes on the homepage (${quotes.length})`);
  const [above, fit] = quotes;
  check(
    /Bespoke Garden Decor/.test(fit?.company ?? ""),
    `fit note is the Bespoke Garden Decor review (${fit?.company})`,
  );
  check(
    fit.quoteSize === above.quoteSize &&
      fit.quoteFamily === above.quoteFamily &&
      fit.quoteLeading === above.quoteLeading,
    `fit note quote matches the section above (${fit.quoteSize}/${fit.quoteLeading} vs ${above.quoteSize}/${above.quoteLeading}, ${fit.quoteFamily})`,
  );
  check(
    fit.companySize === above.companySize &&
      fit.attributionSize === above.attributionSize,
    `fit note attribution matches (${fit.companySize} / ${fit.attributionSize})`,
  );
  check(
    fit.starCount === 5,
    `fit note has exactly five stars (${fit.starCount})`,
  );
  check(
    fit.starColour === "rgb(18, 168, 255)",
    `fit note stars are Puzzle blue (${fit.starColour})`,
  );
  check(
    fit.starCount === above.starCount,
    "fit note stars sit where the section above puts them",
  );
  check(
    fit.srLabel === "5 out of 5 stars",
    `fit note rating is announced once, not five times (${fit.srLabel})`,
  );
  check(
    fit.attribution === "Richard — Founder",
    `fit note attribution reads correctly (${fit.attribution})`,
  );
  check(
    fit.text.startsWith("They pushed back on our brief twice"),
    `fit note wording is unchanged (${fit.text})`,
  );

  /* The heading. Checked as text, not by eye: the reveal splits it into
     per-line spans, and a lost separator there is exactly the kind of thing
     that renders fine at one width and reads "clientssaid" at another. */
  const headings = await page.evaluate(() =>
    [...document.querySelectorAll("h2")].map((h) => h.textContent),
  );
  const said = headings.find((h) => /clients/i.test(h));
  check(
    said === "What clients said afterwards",
    `heading reads cleanly with its spaces (${JSON.stringify(said)})`,
  );

  // …and at a width where it has to wrap.
  await page.setViewportSize({ width: 420, height: 900 });
  await page.waitForTimeout(600);
  const wrapped = await page.evaluate(
    () =>
      [...document.querySelectorAll("h2")]
        .map((h) => h.textContent)
        .find((t) => /clients/i.test(t)),
  );
  check(
    wrapped === "What clients said afterwards",
    `heading survives wrapping (${JSON.stringify(wrapped)})`,
  );
  await ctx.close();
}

/* ================================================= 3. the articles page */
{
  const [page, ctx, errors] = await newPage();
  await page.goto(`${base}/articles`, { waitUntil: "load" });
  await page.waitForTimeout(1500);

  const shape = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href^="/articles/"]')];
    return {
      count: links.length,
      slugs: links.map((a) => a.getAttribute("href")),
      h1: document.querySelector("h1")?.textContent,
      h2s: [...document.querySelectorAll("h2")].map((h) => h.textContent.trim()),
      images: [...document.querySelectorAll("img")].map((img) => ({
        src: new URL(img.currentSrc || img.src, location.href).pathname,
        alt: img.getAttribute("alt"),
        w: Math.round(img.getBoundingClientRect().width),
        h: Math.round(img.getBoundingClientRect().height),
        natW: img.naturalWidth,
        natH: img.naturalHeight,
        fit: getComputedStyle(img).objectFit,
      })),
      overflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    };
  });

  check(shape.count === 6, `articles: all six pieces are linked (${shape.count})`);
  check(
    new Set(shape.slugs).size === 6,
    "articles: no duplicated links",
  );
  check(
    shape.h1 === "Opinions we’re willing to defend" && shape.h2s.length === 6,
    `articles: one h1 and six h2s (${shape.h2s.length})`,
  );
  check(
    shape.h2s[0] === "The tenth screen",
    `articles: the newest piece leads (${shape.h2s[0]})`,
  );
  check(
    shape.images.length === 4,
    `articles: the four generated posters are used (${shape.images.length})`,
  );
  check(
    shape.images.every((i) => i.src.startsWith("/_next/image") || i.src.startsWith("/articles/")),
    `articles: images come from the project's own assets (${shape.images.map((i) => i.src.slice(0, 24)).join(", ")})`,
  );
  check(
    shape.images.every((i) => (i.alt ?? "").length > 20),
    "articles: every image describes itself in alt text",
  );
  check(
    shape.images.every((i) => i.fit === "cover"),
    "articles: images are object-fit: cover",
  );
  /* Undistorted: the frame's ratio must match the source's, so `cover` has
     nothing to crop and nothing is stretched. */
  const ratios = shape.images.map((i) =>
    Math.abs(i.w / i.h - i.natW / i.natH),
  );
  check(
    ratios.every((d) => d < 0.02),
    `articles: frames match the source ratio, nothing distorted (max delta ${Math.max(...ratios).toFixed(3)})`,
  );
  check(
    shape.images.every((i) => i.w <= i.natW + 1),
    `articles: no upscaling past the source (${shape.images.map((i) => `${i.w}/${i.natW}`).join(", ")})`,
  );

  /* The alternation actually alternates. Counted from the rendered geometry:
     is the picture left or right of the words in each row that has one? */
  const sides = await page.evaluate(() =>
    [...document.querySelectorAll("li")]
      .map((li) => {
        const img = li.querySelector("img");
        const h2 = li.querySelector("h2");
        if (!img || !h2) return null;
        return img.getBoundingClientRect().left < h2.getBoundingClientRect().left
          ? "L"
          : "R";
      })
      .filter(Boolean),
  );
  check(
    sides.length >= 3 && sides.every((s, i) => i === 0 || s !== sides[i - 1]),
    `articles: pictures alternate side down the page (${sides.join(" ")})`,
  );
  check(shape.overflow <= 0, `articles: no horizontal overflow (${shape.overflow}px)`);
  check(errors.length === 0, `articles: no console errors (${errors.join(" | ")})`);

  /* Hover: the picture scales, the title moves and the underline draws.
     Read from `scale`, not `transform` — Tailwind v4 compiles `scale-*` to the
     standalone property, so a test watching `transform` sees "none" throughout
     and passes or fails for reasons unrelated to the thing it names. */
  const first = page.locator("li a.group").first();
  const hoverState = () =>
    page.evaluate(() => {
      const img = document.querySelector("li img");
      const a = img.closest("a");
      return {
        scale: getComputedStyle(img).scale,
        underline: getComputedStyle(a.querySelector("h2 span span")).scale,
        title: getComputedStyle(a.querySelector("h2")).color,
      };
    });
  const before = await hoverState();
  await first.hover();
  await page.waitForTimeout(700);
  const after = await hoverState();
  check(
    before.scale !== after.scale,
    `articles: picture scales on hover (${before.scale} to ${after.scale})`,
  );
  check(
    before.underline !== after.underline,
    `articles: title underline draws on hover (${before.underline} to ${after.underline})`,
  );
  check(
    before.title !== after.title,
    `articles: title takes the accent on hover (${before.title} to ${after.title})`,
  );

  // Keyboard: the whole row is one tab stop with a visible ring.
  const focus = await page.evaluate(() => {
    const a = document.querySelector("li a");
    a.focus();
    const cs = getComputedStyle(document.activeElement);
    return {
      isLink: document.activeElement === a,
      outline: `${cs.outlineWidth} ${cs.outlineStyle}`,
      nested: a.querySelectorAll("a, button").length,
    };
  });
  check(focus.isLink, "articles: the row itself takes focus");
  check(
    parseFloat(focus.outline) > 0 && !focus.outline.includes("none"),
    `articles: focus ring is visible (${focus.outline})`,
  );
  check(focus.nested === 0, "articles: nothing interactive nested inside the row link");
  await ctx.close();
}

/* ===================================== articles: responsive + reduced motion */
for (const [w, h, label] of [
  [390, 844, "mobile"],
  [820, 1180, "tablet"],
  [1280, 720, "laptop"],
  [2560, 1440, "large desktop"],
]) {
  const [page, ctx] = await newPage({ width: w, height: h });
  await page.goto(`${base}/articles`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  const r = await page.evaluate(() => ({
    overflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    // Tap targets: the row links have to stay comfortably large.
    minLink: Math.min(
      ...[...document.querySelectorAll('a[href^="/articles/"]')].map((a) =>
        Math.round(a.getBoundingClientRect().height),
      ),
    ),
    imgW: Math.max(
      0,
      ...[...document.querySelectorAll("img")].map((i) =>
        Math.round(i.getBoundingClientRect().width),
      ),
    ),
  }));
  check(r.overflow <= 0, `${label} ${w}x${h}: no horizontal overflow (${r.overflow}px)`);
  check(r.minLink >= 44, `${label}: row tap targets stay large (${r.minLink}px)`);
  check(
    r.imgW > w * 0.35,
    `${label}: imagery stays prominent (${r.imgW}px of ${w})`,
  );
  await ctx.close();
}

{
  const [page, ctx] = await newPage({ reduced: true });
  await page.goto(`${base}/articles`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const still = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("li")];
    const opacities = rows.map((li) => {
      const box = li.querySelector("div[style], .lg\\:col-span-6, div");
      return box ? Number(getComputedStyle(box).opacity) : 1;
    });
    const media = document.querySelector("li img")?.parentElement;
    return {
      opacities,
      mediaTransform: media ? getComputedStyle(media).transform : null,
      firstVisible: Number(
        getComputedStyle(document.querySelector("h2").closest("div")).opacity,
      ),
    };
  });
  check(
    still.firstVisible === 1,
    `reduced motion: the lead piece is simply present (opacity ${still.firstVisible})`,
  );
  check(
    still.opacities.every((o) => o === 1),
    `reduced motion: every row is present without scrolling (${still.opacities.join(", ")})`,
  );
  check(
    still.mediaTransform === "none" || still.mediaTransform === "matrix(1, 0, 0, 1, 0, 0)",
    `reduced motion: pictures are not offset or scaled (${still.mediaTransform})`,
  );

  /* And the hover does not move either. `motion-reduce:transform-none` reads
     like it covers this and does not: Tailwind v4 compiles `scale-*` to the
     standalone `scale` property, which `transform: none` leaves alone. The
     scale is gated on `motion-safe:` instead, and this is the check that says
     so. */
  await page.locator("li a.group").first().hover();
  await page.waitForTimeout(600);
  const hoverScale = await page.evaluate(
    () => getComputedStyle(document.querySelector("li img")).scale,
  );
  check(
    hoverScale === "none" || hoverScale === "1",
    `reduced motion: hover does not scale the picture either (${hoverScale})`,
  );
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
