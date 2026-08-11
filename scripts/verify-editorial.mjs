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

/* ================================== 1. the Levant work section, now white */
{
  const [page, ctx, errors] = await newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(1200);

  const field = await page.evaluate(
    ([contrastSrc]) => {
      const ratio = eval(contrastSrc);
      /* The section is identified by its heading, not by the attribute that
         happens to be setting its surface — that attribute has now been both
         `data-blue` and `data-invert`, and a test keyed to it would have gone
         green on the wrong section. */
      const section = [...document.querySelectorAll("section")].find((el) =>
        /Recent work/.test(el.querySelector("h2")?.textContent ?? ""),
      );
      if (!section) return null;
      const bg = getComputedStyle(section).backgroundColor;
      const at = (sel) => {
        const el = section.querySelector(sel);
        return el ? getComputedStyle(el).color : null;
      };
      const tile = section.querySelector("img");
      return {
        bg,
        paper: getComputedStyle(document.documentElement)
          .getPropertyValue("--paper")
          .trim(),
        heading: section.querySelector("h2")?.textContent,
        tileTitle: section.querySelector("h3")?.textContent,
        tileSrc: tile ? new URL(tile.currentSrc || tile.src).searchParams.get("url") : null,
        tileW: tile ? Math.round(tile.getBoundingClientRect().width) : 0,
        pill: section.querySelector('a[href="/work"]')?.textContent,
        eyebrowContrast: ratio(bg, at("p.mono")),
        headingContrast: ratio(bg, at("h2")),
        tileTitleContrast: ratio(bg, at("h3")),
        summaryContrast: ratio(bg, at("p:not(.mono)")),
        pillContrast: ratio(bg, at('a[href="/work"]')),
        accent: getComputedStyle(section).getPropertyValue("--accent").trim(),
        width: Math.round(section.getBoundingClientRect().width),
        viewport: window.innerWidth,
      };
    },
    [CONTRAST],
  );

  check(Boolean(field), "work section: found by its heading");
  check(
    field.bg === "rgb(255, 255, 255)",
    `work section: background is white (${field.bg})`,
  );
  check(
    /^#f{3,6}$/i.test(field.paper),
    `work section: that is the --paper token (${field.paper})`,
  );
  check(
    /LEVANT/i.test(field.tileTitle ?? ""),
    `work section: still the Levant tile (${field.tileTitle})`,
  );
  check(
    /levant/i.test(field.tileSrc ?? "") && field.tileW > 400,
    `work section: the Levant image is untouched and full width (${field.tileW}px)`,
  );
  check(
    /All work/.test(field.pill ?? ""),
    `work section: the copy and link are unchanged (${field.pill?.trim()})`,
  );
  check(
    field.width === field.viewport,
    `work section: still full-bleed (${field.width} of ${field.viewport})`,
  );
  for (const [name, r] of [
    ["eyebrow", field.eyebrowContrast],
    ["heading", field.headingContrast],
    ["tile title", field.tileTitleContrast],
    ["summary", field.summaryContrast],
    ["pill", field.pillContrast],
  ]) {
    check(r >= 4.5, `work section: ${name} contrast ${r}:1 on the white`);
  }

  /* The hover must still register against the new surface. Scoped to the
     section by its heading — "the first h3 on the page" is a services card in
     the hero, which is hovered by nothing and never changes. */
  const tileTitle = page
    .locator("section", { has: page.locator("h2", { hasText: "Recent work" }) })
    .locator("h3")
    .first();
  const before = await tileTitle.evaluate((el) => getComputedStyle(el).color);
  await page
    .locator("section", { has: page.locator("h2", { hasText: "Recent work" }) })
    .locator("a.group")
    .first()
    .hover();
  await page.waitForTimeout(400);
  const after = await tileTitle.evaluate((el) => getComputedStyle(el).color);
  check(
    before !== after,
    `work section: the tile title still changes on hover (${before} to ${after})`,
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
    shape.images.length === 6,
    `articles: every piece now carries artwork (${shape.images.length} of 6)`,
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

/* ==================================== articles: depth, structure, figures */
{
  const [page, ctx] = await newPage();
  const slugs = [
    "the-tenth-screen",
    "motion-that-earns-it",
    "how-ai-is-reshaping-creative-design",
    "what-a-rebrand-cannot-fix",
    "designing-for-models-that-are-wrong",
    "the-brief-is-the-deliverable",
  ];
  const seenLinks = new Set();
  for (const slug of slugs) {
    await page.goto(`${base}/articles/${slug}`, { waitUntil: "load" });
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const art = document.querySelector("article");
      const figs = [...art.querySelectorAll("figure")];
      const box = art.getBoundingClientRect();
      const height = box.height;
      const at = figs[1]
        ? Math.round(
            (((figs[1].getBoundingClientRect().top + window.scrollY) -
              (box.top + window.scrollY)) /
              height) *
              100,
          )
        : null;
      return {
        h1: art.querySelectorAll("h1").length,
        h2: art.querySelectorAll("h2").length,
        h3: art.querySelectorAll("h3").length,
        words: art.innerText.trim().split(/\s+/).length,
        figures: figs.length,
        figurePct: at,
        // The inline-link syntax must never reach the page as text.
        rawMarkup: /\]\(/.test(art.innerText),
        links: [...art.querySelectorAll("p a, aside a")].map((a) =>
          a.getAttribute("href"),
        ),
        firstIsHero: art.querySelector("figure img")?.getAttribute("alt") ?? "",
        title: document.title,
        desc:
          document.querySelector('meta[name="description"]')?.content ?? "",
      };
    });
    r.links.forEach((l) => seenLinks.add(l));

    check(r.h1 === 1, `${slug}: exactly one h1 (${r.h1})`);
    check(r.h2 >= 4, `${slug}: sectioned with h2s (${r.h2})`);
    check(r.h3 >= 2, `${slug}: uses h3 beneath them (${r.h3})`);
    check(
      r.words >= 700,
      `${slug}: substantial at ${r.words} words`,
    );
    check(!r.rawMarkup, `${slug}: no unparsed link markup on the page`);
    check(r.links.length >= 3, `${slug}: carries internal links (${r.links.length})`);
    check(r.firstIsHero.length > 20, `${slug}: opens with its thumbnail`);
    check(
      r.title.length > 10 && r.title.length < 90,
      `${slug}: title is a usable length (${r.title.length})`,
    );
    check(
      r.desc.length > 80 && r.desc.length < 220,
      `${slug}: meta description is a usable length (${r.desc.length})`,
    );
    /* The body figure has to sit near the middle of the EXPANDED piece. The
       indices were chosen for the short versions and would otherwise sit a
       fifth of the way down. */
    if (r.figures > 1) {
      check(
        r.figurePct >= 30 && r.figurePct <= 70,
        `${slug}: body figure sits mid-article (${r.figurePct}%)`,
      );
    } else {
      check(r.figures === 1, `${slug}: thumbnail only, no stray figure`);
    }
  }

  // Every internal link a body points at must resolve.
  for (const href of [...seenLinks].filter((h) => h?.startsWith("/"))) {
    const res = await page.goto(base + href, { waitUntil: "commit" });
    check(res.status() === 200, `body link resolves: ${href} (${res.status()})`);
  }
  await ctx.close();
}

/* ======================= homepage: the editorial selection is not derived */
{
  const [page, ctx] = await newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  const cards = await page.$$eval('a[href^="/articles/"] h3', (els) =>
    els.map((e) => e.textContent.trim()),
  );
  check(
    cards.includes("The brief is the deliverable"),
    `homepage keeps "The brief is the deliverable" (${cards.join(" · ")})`,
  );
  check(
    !cards.includes("How AI Is Reshaping Creative Design"),
    "homepage: the AI piece did not displace it",
  );
  check(cards.length === 4, `homepage still shows four cards (${cards.length})`);

  const quotes = await page.$$eval("blockquote", (els) => els.length);
  const saidHeadings = await page.$$eval("h2", (els) =>
    els.filter((e) => /clients said/i.test(e.textContent)).length,
  );
  check(quotes === 2, `both testimonials render (${quotes})`);
  check(
    saidHeadings === 1,
    `"What clients said afterwards" appears exactly once (${saidHeadings})`,
  );
  const order = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h2")].find((e) =>
      /clients said/i.test(e.textContent),
    );
    const qs = [...document.querySelectorAll("blockquote")];
    const y = (el) => el.getBoundingClientRect().top + window.scrollY;
    return qs.every((q) => y(q) > y(h));
  });
  check(order, "the heading sits above both quotes, not between them");
  await ctx.close();
}

/* ============================== about: every major heading uses the reveal */
{
  const [page, ctx] = await newPage();
  await page.goto(`${base}/about`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const heads = await page.evaluate(() =>
    [...document.querySelectorAll("main h1, main h2, main h3")].map((h) => ({
      tag: h.tagName,
      text: h.textContent.trim(),
      /* A revealed heading is wrapped per line in an overflow-hidden mask —
         that wrapper is the signature of the shared implementation, so this
         cannot pass against a lookalike animation. */
      revealed: Boolean(h.querySelector("span.block.overflow-hidden")),
      inSequence: Boolean(h.closest("li")?.style.opacity !== undefined && h.closest("ol")),
    })),
  );
  const majors = heads.filter((h) => h.tag !== "H3" || !h.inSequence);
  check(
    majors.every((h) => h.revealed),
    `about: every major heading uses the shared reveal (${majors.filter((h) => !h.revealed).map((h) => h.text).join(", ") || "all"})`,
  );
  check(
    heads.filter((h) => h.revealed).length >= 10,
    `about: reveal applied broadly (${heads.filter((h) => h.revealed).length} headings)`,
  );

  /* Plays once, and does not reverse. The heading has to be scrolled THROUGH,
     not jumped past: an instant jump beyond an element means it never
     intersects, the observer reports false, and the assertion would fail for a
     reason that has nothing to do with the animation. */
  const target = await page.evaluate(() => {
    const h = [...document.querySelectorAll("main h2")].find((el) =>
      el.querySelector("span.block.overflow-hidden"),
    );
    return Math.round(h.getBoundingClientRect().top + window.scrollY);
  });
  const opacity = () =>
    page.evaluate(() => {
      const h = [...document.querySelectorAll("main h2")].find((el) =>
        el.querySelector("span.block.overflow-hidden"),
      );
      return getComputedStyle(h.querySelector("span.block.overflow-hidden > span.block"))
        .opacity;
    });

  // Bring it into view.
  await page.evaluate((y) => window.scrollTo(0, y - 500), target);
  await page.waitForTimeout(1500);
  const lit = await opacity();
  check(lit === "1", `about: heading reveals when scrolled to (${lit})`);

  // Well past it, then back to the top — it must still be shown.
  await page.evaluate((y) => window.scrollTo(0, y + 2000), target);
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
  const stillLit = await opacity();
  check(
    stillLit === "1",
    `about: it does not reverse on the way back up (${stillLit})`,
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
