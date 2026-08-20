# Puzzle — build notes

Decisions, and things I'd revisit. Newest section last.

## Stack as installed

| | |
|---|---|
| Next.js | 16.2.12 (App Router, Turbopack) |
| React | 19.2.4 |
| Tailwind | v4 (CSS-first `@theme`, no `tailwind.config.js`) |
| Motion | `motion` 12.43 — the current package name for Framer Motion; imports are `motion/react` |
| Lenis | 1.3.25 |
| matter-js | 0.20 (+ `@types/matter-js`) — for the Labs toy and the About board |
| Playwright | dev-only, for the loader capture script |

`npm audit` reports 12 high-severity advisories. All are transitive dev-chain
(ReDoS in `minimatch`/`brace-expansion` via the ESLint plugins, plus
`postcss`/`sharp` under `next`). Nothing reaches the runtime bundle.
`npm audit fix` resolves none of them without `--force`, which would downgrade
`eslint-config-next`. Left alone deliberately.

## Tokens

Three layers, in `app/globals.css`:

1. **raw brand** — the eight hexes from the brief. The only hexes in the codebase.
2. **semantic** — `--surface`, `--content`, `--rule`, `--link`. Components use these.
3. **Tailwind** — `@theme inline` maps semantic vars to utilities. `inline` matters:
   it makes utilities emit `var(--surface)` rather than baking a value, which is
   what lets `[data-invert]` flip a whole section at runtime.

Light sections are `<section data-invert>`. That reassigns the semantic layer, so
any component dropped inside inverts with no extra classes and no `dark:` variants.

**Contrast finding that shaped the tokens:** `--blue` on `--paper` is ~2.6:1 and
fails AA for text. Blue-on-white is the obvious link colour in a light section and
it is not usable. So `--link` is semantic: `--blue` on ink, `--ink` with a blue
underline when inverted. Blue on white is reserved for large type and the mark.
`--coral` on `--ink` is ~9.4:1 and `--blue` on `--ink` ~7.9:1 — both fine.

## Fonts

All three via `next/font/google`, self-hosted, `display: swap`. No CDN links.

- **Instrument Serif** (display) — one weight, ~40KB, and its italic has real
  calligraphic slope rather than a mechanical slant. That is the deciding factor:
  roman and italic have to read as clearly different *inside one headline* at 11vw.
  Bodoni Moda would have meant shipping several weights for the same effect.
- **Geist** (body) — available through `next/font/google`, so the `geist` npm
  package is redundant; using one mechanism for all three.
- **IBM Plex Mono** (utility) — 400/500, `0.14em` tracking, uppercase, via `.mono`.

## The mark

There are **two** marks, deliberately kept apart:

| | site logo | intro loader |
|---|---|---|
| geometry | `components/brand/puzzle-paths.ts` | `components/brand/puzzle-loader-paths.ts` |
| component | `components/brand/PuzzleSiteLogo.tsx` | `components/brand/PuzzleMarkAnimation.tsx` |
| treatment | solid blue + white keyline | stroke-only outline on ink |
| pieces | held apart by `SEAM_GAP` | locked, edge to edge |

The loader geometry is a frozen copy taken at commit `f9b998f`, before the logo
was rebuilt from the corrected artwork. It is duplicated rather than imported on
purpose: **editing the site logo must have zero visual effect on the loader.**
Verified by replacing both site pieces with triangles and confirming the
loader's rendered path data hashed identically.

The loader's pieces now render through `PuzzleMarkAnimation`, which the route
transition also uses — one connect animation, two stagings. That was an
extraction, not a redesign, and the frozen rule has not moved: the geometry is
still the pre-rebuild copy, still unreachable from the site logo. Verified by
diffing the loader's rendered markup and its whole travel curve across the
change; the geometry came back byte-identical and every landmark landed inside
the run-to-run jitter of two identical runs. `verify:chrome` now keeps a
regression check on it.

`puzzle-paths.ts` is the source of truth for the site logo only.
`PuzzleSiteLogo.tsx`, `public/logo.svg` and `public/icon.svg` read from it.

`scripts/gen-logo.mjs` regenerates the static SVGs from the TS source
(`npm run gen:logo`) so the files cannot drift from the component. No per-piece
transform survives the lock animation — it ends on exactly `x: 0, y: 0`.

The geometry is the corrected artwork in `public/Puzzle Logo.svg`, remapped out
of its native 714 box into the canonical 1000 box by a single uniform scale
(1.687434) applied to both pieces, so the remap cannot disturb the seam and the
mark keeps the on-screen size it had before. The pieces **do not touch**: they
are cut from one path and held apart by `SEAM_GAP` (31.75 units). Tab and socket
are inverse shapes about a shared centre — socket radius = tab radius + the full
gap — so the band holds its width all the way round the tab rather than pinching
at the flanks. It widens at the neck of the tab, which is intended.

## The signature: the seam

The mark's defining feature is the band where the pieces separate, not the
pieces. It reads as background rather than ink, so the mark needs no second
colour and `currentColor` still drives the whole thing. That band is echoed as a
blue line elsewhere on the site, a persistent object that changes role:

- loader → the seam the pieces lock along
- route change → *was* the diagonal the wipe parts on; the route transition is
  now a full sheet of blue (see below) and `SeamPanels` is the loader's alone
- article page → scroll-progress fill *(not built yet)*
- contact form → interlocking step bar *(not built yet)*

`SeamPanels` avoids per-viewport `clip-path` maths by rotating an oversized
wrapper to the seam angle and sliding two stacked halves apart on the rotated Y
axis. That is exactly the seam normal, and it stays correct at any aspect ratio.

## Loader timing

```
0.00  ink covers, counter starts (eased, 1.15s)
0.00  piece A stroke-draws (0.9s)
0.20  piece B stroke-draws (0.9s)
1.15  lock begins — pieces travel 90 viewBox units along the seam normal
1.65  locked, with a 7% overshoot then settle on 0
1.87  panels part on the diagonal; hero is cued here
2.32  overlay removed
```

**Found and fixed:** originally the lock landed at 1.75s and the fade began at
1.75s, so the one moment the mark existed whole was the moment it started
disappearing. Added `LOCK_HOLD` (0.22s) and pulled the draw in slightly to pay
for it. Hero is still cued at 1.87s and the overlay is `pointer-events-none`
throughout, so nothing is ever blocked.

Runs once per session (`sessionStorage`, wrapped in try/catch for private
browsing). Under `prefers-reduced-motion` the mark shows statically at 100 for
300ms then clears — no draw, no travel. Lenis is not mounted at all in that case;
it hijacks wheel events even at duration 0, which is the thing those users are
asking us not to do.

## Verification tooling

`scripts/shoot-loader.mjs` captures six frames anchored to the loader mounting,
audits the live SVG (fill, stroke, background rect, wordmark, dash state) and
collects console errors. Two traps it exists to avoid:

- **warm the route first** — Turbopack's first compile was 1.8s, which pushed
  every frame past the end of the sequence and made it look like nothing animated;
- **fresh browser context per run** — the intro is once-per-session, so a reused
  context silently skips it and the frames look correct while testing nothing.

`scripts/preview-mark.mjs` rasterises the static SVGs for a quick eyeball.
Both write to `.preview/`, which is gitignored.

## Bugs found during verification

Recorded because each rendered *fine* and was wrong.

1. **Cursor disc labelled "on" everywhere.** `Cursor` set `data-cursor="on"` on
   `<body>` as its enable flag, while `data-cursor="View"` is the per-element
   label. `closest("[data-cursor]")` therefore matched `<body>` from anywhere,
   so every hover showed a disc reading "ON". Renamed the flag to
   `data-custom-cursor`. There is now a regression check asserting `<body>`
   carries no `data-cursor`.
2. **Team cards could not be dragged.** `TeamBoard` passed `animate={{ x, y }}`
   alongside `drag`; the animation prop fights the gesture and the drag never
   commits. Rebuilt on `useMotionValue` so the gesture owns the transform.
3. **Loader lock had no beat** (see timing section above).
4. Two *test* faults worth noting, since both initially looked like product
   bugs: synthetic mouse events are viewport-relative, so dragging a card below
   the fold silently does nothing (fix: `scrollIntoViewIfNeeded`); and asserting
   an `AnimatePresence` element is gone needs a wait longer than its exit
   duration.

## Lint: `react-hooks/set-state-in-effect`

The React compiler lint flagged 8 instances. All were fixed properly rather than
suppressed, and three were genuine improvements:

- `useMediaQuery` (new, `lib/hooks/`) built on `useSyncExternalStore` — matchMedia
  really is an external store, and it gives an explicit server snapshot.
- `Header` now derives "is the menu open" from the pathname it was opened on,
  instead of an effect that closes it after paint.
- `RouteTransition` uses a ref for `firstPaint` — nothing renders from it, so
  state only cost an extra render.

The rest defer a single frame via `requestAnimationFrame`, which is honest: the
values genuinely aren't knowable during SSR.

## What each interaction actually does

Verified by `npm run verify:interactions` (13 assertions, all passing) rather
than by eye:

| Route | Interaction | Asserted |
|---|---|---|
| `/services` | Scope builder | Pieces seat via shared `layoutId`; estimate is live; phases *overlap* (8w + 7w → 12w, not 15w); send carries params |
| `/contact` | Prefill + gate | Scope arrives from the builder; unconfigured state is declared, never faked |
| `/` | Mega-menu | Both columns render; Esc closes |
| `/labs` | Tessellation | Pieces drop, and the canvas is sampled for lit pixels to prove they paint |
| `/about` | Team board | Card drags loose (7/8), reassemble seats all (8/8) |
| `/industries` | Filter | Grid narrows 12 → 2 with layout reorder |

## The wordmark: Gilroy

The "puzzle" logo — header lockup and the large footer wordmark — is set in
Gilroy via the `.wordmark` class. Headlines stay on `.display` (Instrument
Serif); this is the logo only.

Gilroy is **commercial** (Radomir Tinkov), not on Google Fonts, so it can't come
through `next/font/google`, and self-hosting it publicly needs a **webfont**
licence — a desktop licence doesn't cover serving the files. No files were
supplied and they aren't ours to redistribute, so `public/fonts/gilroy/` ships
with a README and nothing else.

**`app/gilroy.css` is generated**, not hand-written. `scripts/gen-gilroy-css.mjs`
runs on `prebuild`/`predev` and emits a `url()` source only for files it can
actually see. The reason is concrete: the first version hard-coded
`url("/fonts/gilroy/Gilroy-Bold.woff2")`, and because the file doesn't exist that
produced **a 404 on every route in the site** — which fails the §8 "no console
errors" floor. Now a missing face carries `local()` alone, makes no network
request, and falls through cleanly.

Drop `Gilroy-Regular.woff2` and `Gilroy-Bold.woff2` into `public/fonts/gilroy/`,
rebuild, and it self-hosts. No code change.

Fallback while absent: `local()` picks up an installed desktop copy if the
visitor has one; otherwise **Geist**, chosen because it's a geometric grotesque
and degrades toward Gilroy's character rather than to the serif.

## The underlapping footer

The footer is pinned to the bottom of the window and the page travels over it,
so it is uncovered rather than scrolled to. One footer, in the DOM the whole
time — covered, not hidden, so nothing is kept from crawlers or screen readers
and there is no second copy for the animation to use.

Three pieces:

| | |
|---|---|
| `.page-layer` | the opaque layer everything is read on. Reserves `--footer-h` beneath itself |
| `.site-footer` | `position: fixed; bottom: 0; z-index: -1` |
| `FooterReveal` | measures the footer, publishes `--footer-h`, and owns the homepage peek |

**`<body>` carries `isolation: isolate`, and that is load-bearing.** A negative
z-index only stays inside the document if an ancestor forms a stacking context;
without it the footer falls through to the canvas and is never visible at all.

**The page layer deliberately has no `z-index`.** A stacking context there would
trap the full-screen overlays pages render from inside `<main>` — the industries
case reader at 85, the process modal at 95 — underneath the header at 50. Paint
order comes from the footer's negative index alone, which needs no context on
the page's side.

The reserve is measured, never guessed, so the document ends up exactly as tall
as it was with the footer in flow and turning the effect on at hydration moves
nothing. A footer taller than the window cannot be pinned to it — its top edge
would sit permanently off-screen — so past that point `data-footer-reveal` goes
to `off` and the footer is an ordinary block again. That is the phone case, and
it is also why the footer was rebuilt dense: the pitch is a cell of the link
grid rather than a band above it, which took it from ~830px to ~596 at 1440 and
is the difference between the reveal running on an ordinary laptop and not.

### The homepage peek

Homepage only, past 50% of the page (not of the document — counting the reserved
footer height would drag the halfway mark up the page every time the footer grew
a line). Shows at 0.5, hides at 0.46; the gap is what stops a wheel notch parked
on the threshold toggling it every frame.

The hand-off is scroll-linked and **opaque**. `--peek-exit` runs 0 → 1 as the
footer uncovers the strip's own height, and 100% of that translation is exactly
the pixels of footer now showing, so the strip slides out of the bottom at the
rate the footer arrives. Both are the same blue, so the only thing that changes
is the writing on it. Fading it instead — the first version — put translucent
type over the footer's own bottom row and a lighter band over the page above the
boundary: two states of the same blue at once, which is the one thing the
hand-off has to avoid. Under reduced motion nothing travels, so there the
*content* fades and the field stays opaque, and the hand-off finishes sooner
(0.45 rather than 0.88) — before the footer's bottom row reaches that band.

One passive scroll listener coalesced to one write per frame, as in
`useParallaxLayers`. React state changes only when the strip crosses a
threshold; the scroll-linked value is written straight to the node.

### The blue

`--blue`, the token — not `SITE_MARK_BLUE` (`#36b6fe`), which is sampled from
the artwork's fill and is what the mark itself is drawn in. **Ink on blue, not
white**: white on `--blue` is 2.6:1, the finding that shaped the token layer in
the first place. `.site-footer` reassigns the semantic layer exactly the way
`[data-invert]` does, so every utility inside flips with no second set of
classes. Measured on the built page: heading 7.35:1, links and labels 5.28:1.
The mark's keyline is ink here rather than its usual white, for the same reason.

`npm run verify:footer` asserts all of it — 71 checks across five viewports,
both motion settings, both modes, and client-side route changes.

## The route transition

A sheet of `--blue` rises over the page, the two mark pieces close together on
it, the route changes behind them, and the sheet carries on up and away. One
movement — it never reverses — at **800ms cover / 100ms covered / 900ms
reveal**, so 1.8s end to end, measured at 1828ms on the wire.

It ran at 380/90/520 first, then 800/90/1100, and landed here. Every change went
into the two moving parts; the covered beat has stayed around a tenth of a
second throughout, because it is the only part that is a wait rather than a
movement and stretching it is what would make this read as a loading screen.

Both curves are gentler than the first version's: the cover's ease-in was
flattening 800ms into apparent lag, and the reveal's expo-out — which spends
three quarters of its travel in the first fifth — left the sheet crawling the
last sliver of screen. The reveal now spends the time it is given, 39/75/95% of
the travel at the quarters.

### The mark, and why the beats are where they are

The pieces are `PuzzleMarkAnimation`, lifted out of `IntroLoader` so the site
has one connect rather than two. Same geometry, same offsets, same curve. What
differs is staging, not motion:

| | intro loader | route transition |
|---|---|---|
| size | `min(52vw,30rem)` — 480px | 96px (1.5x the 64 it was) |
| outlines | stroke-drawn first | already drawn |
| separation | 1x | 2.2x |
| stroke | 7 | 16 |
| ends | locked, then the panels part | locked, then parts again as the page opens |

Inside the sheet's 1.8s, and adding nothing to it:

```
0.34  pieces fade up, apart — the earliest the blue covers all of them
0.48  fully visible, still apart
0.50  they start closing
0.80  seated, on the frame the sheet finishes covering
0.90  the sheet leaves, and they part again with it
1.14  mark gone, while the middle of the screen is still blue
```

Three things here were found by measuring, not by reasoning:

1. **The close starts well after the fade.** Run together, as first written, the
   pieces were 90% closed by the time the mark reached full opacity — because
   `MARK_EASE_LOCK` is expo-out and spends half its travel in the first tenth of
   its duration. A connect animation playing entirely behind a fade.
2. **The separation is 2.2x.** It scales with the mark, and this one is a fifth
   the loader's size: at 1x the pieces travel six pixels, and "connecting" is a
   word for something nobody can see. 2.2 puts it at thirteen.
3. **`overflow-visible` on that svg.** A UA stylesheet clips an `<svg>` to its
   own box, and at 2.2x the pieces stand outside the viewBox — they were being
   drawn with their outer corners sliced flat. Caught in a screenshot. The
   loader never hits it, so the class is on the transition instance only.

The mark is a **sibling** of the sheet, not a child. As a child it rode the
translation, so at two thirds of the way up the "centred" mark sat near the
bottom edge and the pieces would have closed while the whole thing travelled.

It parts again on the way out rather than fading in place: the mark seats to
close the old page and opens to let the new one through, and the last thing on
screen is still moving the same way the sheet is.

Under reduced motion nothing travels — sheet or pieces. The mark is still shown,
seated, so the transition still says whose site this is; it arrives rather than
assembles. ~600ms end to end.

**No link was rewritten.** One capture-phase `click` listener on the document
sees every anchor before React does, and `next/link` returns early when
`e.defaultPrevented` is set (`link.js`), so preventing the default is enough to
take the navigation over. Prefetching, hover intent, `<Link>` semantics, server
components, metadata and the scroll reset are untouched — this changes *when*
the push happens, not what a link is. Capture matters: the anchor's own handler
runs in the bubble phase, so a bubble listener arrives too late.

Left alone, deliberately: other origins, `mailto:` and `tel:` (origin is the
string `"null"`, so the same-origin test rejects them), `target=_blank`,
`download`, modifier-clicks, and **anything landing on the pathname already
showing** — an in-page anchor, a link back to the current page, or a
query-string change like the scope handover to `/contact`. That last one is not
tidiness: the reveal waits on the pathname, so claiming a search-only push would
leave the sheet up until the safety timeout. `data-no-transition` on an anchor
opts out.

Navigations that never touch an anchor — the ⌘K palette is a list of buttons —
go through `route-transition-bus.ts`, which falls back to a plain push when the
transition is not mounted.

Back/forward is handled by *not* handling it: the pathname changes with the
phase still idle, which means something else navigated, so the veil simply comes
down. Covering retroactively would be a blue flash over a page already on
screen. A second click during a transition is dropped rather than queued, and
`PATIENCE` (2.4s) guarantees nothing can hold the screen if a route never
commits.

Under reduced motion nothing travels: same choreography, opacity only, ~370ms.

The phase is derived during render rather than in an effect — React's documented
way to adjust state when an input changes, and here also the correct timing,
since an effect would leave a frame where the new route has rendered while the
sheet still believes it is covering. `react-hooks/set-state-in-effect` catches
the other version.

## Navigation: Services and Industries

Two top-level items with a panel each, rather than one panel with two columns.
They answer different questions — what we do, and who we have done it for — and
burying the second inside the first made it findable only by someone already
looking for the first. Neither list is duplicated; each appears under exactly
one heading. The panel sizes itself from its own column count (26rem for one,
44rem for two), so a single list is not one narrow column in a field of empty.

The desktop nav moved from `md` to `lg`. Six top-level items plus the pill
measures ~750px of a 768px screen — it fits by a hair and wraps on any longer
label. The palette is already the navigation below that, and it carries every
route, so the tablet range simply uses it.

## The cursor

There was a custom puzzle-piece cursor following the pointer, with `cursor: none`
on the document beneath it. It is gone — component, listeners, CSS rule and the
`data-cursor` labels that fed it. The site uses the native cursor.

One thing to know if you are reading old test code: `verify-routes` used the
cursor's `data-custom-cursor` flag as its "React has hydrated" signal. It now
waits on the palette's own `data-palette-open`, which is a better signal for the
⌘K assertion anyway.

## The blue field

A third structural surface, alongside ink and `[data-invert]` paper:
`<section data-blue>`, which the footer and the homepage peek also use. One
definition of what that surface is, so the LEVANT work section closes ranks with
the footer rather than approximating it. Ink on blue throughout — measured on
the built page at 7.35:1 for headings and the tile title, 5.28:1 for the eyebrow
and summary.

It needed one new token. `--accent` is the colour an interactive title, border
or arrow moves *to* on hover: blue on ink and on paper, paper on the blue field,
because there blue is the background. `WorkTile` says `group-hover:text-accent`
and no longer needs to know what it was dropped onto — which is what let the
same tile appear on the blue section with its hover intact and nothing changed
on /work or in the industry grids.

## The two quotes

The fit note was an accordion of one: a disclosure button hiding a single quote,
at half the size of the testimonial further up the page, with the name given
more weight than the words. Two quotes, two systems, no reason.

`TestimonialQuote` is now both of them — same stars, same measure, same sizes,
same entrance. What differs is the framing above it: the fit note keeps its
eyebrow and heading because it is a labelled section, and it still names the
project it belongs beside. `rating` moved into `lib/team.ts` rather than being
hard-coded at five in the component, so a rating that is not five cannot be
misreported by a section that assumes it.

## The articles page

It was a bordered table — date, title, standfirst, reading time, six times over
— and the generated artwork existed the whole time with only the homepage teaser
showing it.

Now: a lead piece (the newest, by construction rather than by a flag — the array
is newest first and the page does not re-sort it), then alternating editorial
rows. Four of the six pieces have artwork; the other two get a wider typographic
row at the larger step, offset to the side the picture would have taken.
Inventing a stand-in or borrowing a neighbour's would both be worse than letting
the layout change, and a text row at that size reads as a deliberate variation.

**The alternation is counted per shape, not per row.** Alternating on the row
index looked obviously right and was not: the three pieces with artwork happen
to sit at even positions, so every one came out with its picture on the left and
the "alternating" layout was a straight rail. Caught in a screenshot, then
asserted from the rendered geometry.

Entrances go through `useArticleEntrance`, which is `useInViewOnce` plus the cue
`RevealHeading` already applies: nothing plays from behind a cover. Without it
the lead piece spends its entrance under the route transition's blue sheet and
the reader arrives at a page that has already finished animating.

### `motion-reduce:transform-none` does not do what it looks like

Tailwind v4 compiles `scale-*` to the standalone `scale` property, and
`transform: none` does not touch it. Two images on the site carried
`group-hover:scale-[1.03] motion-reduce:transform-none` and were still scaling
on hover for readers who had asked for no movement — verified by emulating the
preference and reading `getComputedStyle().scale`, which reported `1.03` in both
modes. Both are now `motion-safe:group-hover:scale-[1.03]`, so the rule does not
exist under the preference rather than being cancelled by one that misses.

Worth knowing generally: a test watching `transform` for a `scale-*` utility
sees `none` throughout and reports whatever it likes.

## Articles: one image model

`image` is the piece's own artwork — the listing card *and* the hero at the top
of the article, so a piece cannot show one face in the index and a different one
when opened. `bodyImage` is an optional second picture set into the body at an
editorial break, with `bodyImageAfter` naming the paragraph it follows
(defaulting to the midpoint, clamped).

Both carry their own `width`/`height`, which is what lets the body figures keep
whatever shape they arrived in. They are not all 3:2 — the tenth screen's is
square — and forcing one into the card's ratio would cut the content out of it
rather than fit it. The card keeps its 3:2 frame with `cover`; the article page
sizes intrinsically and never crops.

Every piece now has artwork, and that had a consequence worth recording: the
homepage teaser filtered on `image` and returned six, which wraps its `xl`
four-column grid onto a second row and hands two cards to a flight plan that
only defines routes for card-0 to card-3 — they would have sat still while the
other four flew. The filter is capped at four.

`contrast-is-not-a-checkbox` was replaced by `how-ai-is-reshaping-creative-design`,
keeping the slot's date so the ordering and the page's left/right rhythm are
unchanged. Nothing links to the old slug.

## The Levant section, again

Blue for one revision, now `[data-invert]` paper. One word, no restyling —
which is the point of the field being an attribute that reassigns the semantic
tokens rather than a set of colours applied per element. `--accent` stays blue
on paper, so the tile's hover and the pill's border still read as the brand.

Worth noting for whoever writes the next test: `verify-editorial` used to find
this section by `[data-blue]`. That selector went green on the wrong thing the
moment the attribute changed, so it now finds the section by its heading.

## About

Rebuilt around the client rather than the studio. The previous version led on
headcount — the heading was a number of people, and a draggable board of eight
named cards with a "n / 8 seated" counter sat beneath it. That is gone:
`TeamBoard` is no longer mounted (the component file remains, unused), and the
suite now asserts the constraint instead — no headcount phrasing anywhere in the
page text.

Also dropped: the 2019 founding year and the team roster, neither of which
anything else on the site supports. What is kept is the one claim it can stand
behind and that the services and process pages already make — the people who
design the work are the people who build it.

Structure is the site's existing punctuation, dark / inverted / dark, with every
major heading through `RevealHeading`. One scroll moment: the journey rule draws
left to right and the four stages arrive along it. It is the only genuinely
sequential thing on the page, which is the whole argument for animating it.

## Article bodies are blocks

`body` was a flat `string[]` of paragraphs — one undifferentiated run of text
with no heading structure, which is hard to scan at length and gives a search
engine nothing to read as sections. It is now `ArticleBlock[]`: `p`, `h2`, `h3`
and a sparing `takeaway`. No CMS and no markdown dependency; the only inline
mark is a link, written `[label](/services)` and handled by a regex in
`ArticleBody` that leaves anything else as text.

Every piece was expanded to roughly three times its previous depth (2.8x–3.4x,
700–1350 words). `readingMinutes` moved with them — it is displayed on the cards
and would otherwise have been wrong by half.

**`bodyImageAfter` is a block index, and it had to move.** The indices were
chosen for five-paragraph pieces; at thirty-odd blocks the same number sits a
fifth of the way down. Both figures are now at a section break near the middle,
measured on the rendered page rather than counted in the data: 45% and 50%.

## The homepage article selection

`ARTICLES.filter(a => a.image).slice(0, 4)` is a rule that quietly changes its
own answer. The moment a newer piece gained artwork it took the fourth slot and
pushed "The brief is the deliverable" off the homepage — a decision nobody made.
The four are now named in `HOMEPAGE_ARTICLE_SLUGS`.

The count matters as much as the contents: the `xl` grid is four across and the
flight plan defines routes for card-0 to card-3, so a fifth card would both wrap
the row and sit motionless while the others flew.

## One heading, both quotes

The two quote sections were separate — an unheaded editorial break carrying the
first, then a headed section carrying the second. Read down the page, the
heading appeared to introduce the second quote and have nothing to do with the
first, which had already gone past. One `Testimonials` section now, heading
above both, with the gap between the quotes larger than the gap from the heading
to the first so the heading reads as belonging to the group.

## About: which headings reveal

All of them except the journey stage labels. Those are already rising and fading
as part of the sequence the section is built around, staggered on the same
curve; wrapping them in the masked reveal as well would be two entrances
animating the same words on different clocks. One movement per element.

Worth knowing if you write a test for this: an instant `scrollTo` *past* an
element means it never intersects, the observer reports false, and the heading
stays hidden — correctly. The reveal has to be scrolled through, not jumped
over, or the assertion fails for a reason unrelated to the animation.

## The web design page

Rebuilt around the work rather than around the description of the work. What it
gained is one editorial block — a statement, the approach in a column beside it,
and four panels of real client screens underneath — set between the headline and
the service detail that was already there. The deliverables, the phase list, the
scope link and the sibling-service nav are untouched.

The page no longer prints `intro` beneath its headline. That sentence — the one
about a layout that only works at 1440px being a picture of a design rather than
a design — is the opening of the showcase's first paragraph instead, where it
has room to be argued. Printing both would have made the same point twice before
the reader had scrolled. The field stays in `lib/services.ts` as the service's
canonical one-liner, and every service without a `showcase` renders exactly as
it did before.

Text on both sides is the layout, not a nicety: a statement with nothing beside
it is a poster, and paragraphs with nothing above them are a page of copy. The
split is 6 / gutter / 5 rather than half and half, and it only exists from `lg`.
Display type at `--step-4` in a half-width tablet column breaks to about one
word a line.

## The showcase grid, and why the panels are square

Four panels separated by the page itself: no rule between them, no frame around
them, no field behind them. 16px two across, 12px stacked. It started as the
`gap-px` over `bg-rule` hairline idiom the LEVANT swatches use, which was right
on ink and wrong the moment the page went to paper — a drawn line where the
answer is negative space. The radius stays at `rounded-xl`, which is what every
other piece of media on the site carries.

Square because three of the four sources are, including the clip, whose phone
stands the full height of its frame. The first attempt used 5:4 and cut the top
and bottom off it — the sort of thing a ratio chosen on paper does to a source
nobody measured. Only the landscape still is cropped now, at the sides, where
its composition already runs off the edge. A per-panel ratio would fit every
source perfectly and lose the alignment that makes four panels read as a
sequence, which is the part worth keeping.

The panels settle out of a slight scale rather than rising into place. A
translate would open a gap at the seam and show the field behind it.

## The web design page runs on paper

`paper: true` on the service, `data-invert` on the `<article>`. That is the
whole light theme — the attribute reassigns the semantic tokens and every
utility on the page already reads from them, so nothing was restyled per
surface. It is set during render, not in an effect, so there is no dark first
paint to flash out of. Every other service page is untouched.

Three things did not come free, and they are the three worth knowing:

**Raw colours do not follow the surface.** Two places named one. The phase tiles
were `bg-ink-raised` and became four dark cards stranded on white;
`bg-surface-raised` resolves to the identical ink-raised on every dark route and
to a near-paper here. And blue is 7.4:1 on ink but 2.6:1 on paper — which is why
the token layer refuses blue for text on a light surface in the first place — so
the deliverable arrows and phase numerals take muted ink on paper instead. Not
`--accent`: that stays blue on both surfaces deliberately, for large type and
borders rather than eleven-pixel labels.

**The header cannot inherit a surface it sits over.** It is fixed, it lives in
the root layout outside the page layer, and on a white page its type was white
on white. It asks instead — `isPaperRoute(pathname)`, derived during render so
SSR gets it right rather than flipping after hydration.

**Reassigning a custom property does not recolour text that inherited its
colour.** The wordmark and the panel copy carry no colour of their own, so they
take `<body>`'s *computed* `color` — resolved from the dark tokens long before
the header exists. `[data-invert]` on the header changes the variables and
changes nothing on screen. Declaring `text-content` at that level is what makes
it re-resolve. Worth remembering for anything else dropped onto an inverted
surface: the token flip only reaches what actually reads a token.

The mega-menu panel moved to `bg-surface-raised` for the same reason as the
phase tiles. The command palette did not — it is a full-screen overlay, dark on
every route by design, and it stays that way over the white page exactly as the
mega-menu's own scrim does.

## A literal `&` in an asset path passes dev and fails the build

The four files arrived in `public/work/Puzzle logo&images/`. Referenced there,
everything works under `next dev` — the raw file 200s and the image optimiser
serves it. In a production build every one of them fails: 404 on the file, and
400 from the optimiser, which reports the source as *"The requested resource
isn't a valid image."* Encoding the `&` as `%26` fixes the raw file and not the
optimiser.

So they are served from a copy at `public/work/web-design/`, under plain
lowercase names — the same answer the article artwork reached. **Do not test an
asset path only in dev.** That folder is a staging area, not a served one, and
anything else pulled out of it needs the same treatment.

## The clip in the grid

Autoplaying, muted, looping, no controls — it is a panel of the grid, not a
player. Two things about it are less obvious.

It fades in on its first decoded frame, because a `<video>` with nothing decoded
is a black rectangle and a black rectangle appearing in a grid of artwork is the
flash worth avoiding. The catch: the element is server-rendered, so the browser
begins loading it while React is still hydrating and `loadeddata` can fire
before the handler exists. An event with no listener is simply gone, and the
panel then sits at `opacity: 0` with a perfectly good frame behind it — which is
exactly what shipped for about ten minutes. `readyState >= 2` in the effect is
that same fact read as state rather than waited for as an event.

And it holds on its first frame under `prefers-reduced-motion` rather than
looping. `autoPlay` stays on the element in both directions so the server and
the client render the same markup; the preference is applied afterwards, in an
effect and in a `play` handler. The full fetch is gated on `seen` rather than on
playback, so reduced motion — which latches `seen` on mount — still gets a frame
to hold.

## Web design and web development are one service

They were never two jobs. They were one problem answered twice — once on a
canvas, once in a repository — and two pages for it sold the seam rather than
the absence of one. `web-design` and `web-development` are now
`web-design-development`, "Web design & development", and both old slugs 308 to
it in `next.config.ts`.

**Both**, not just the development one. The merged slug is new, so the design
page's own URL would have broken too, and of the pair it is the one with links
worth keeping. The service count is unchanged at seven, because UX & UI design
arrived in the same pass — so "Seven ways we can help" on `/services` is still
true, which is luck rather than planning and is worth knowing if a service is
ever added or dropped.

The showcase, its four panels and the paper surface are exactly as they were.
What changed is the argument around them, and the deliverables and phases, which
are the two old lists reconciled into one twelve-week run.

## The grid is a component now, and /work inverts to use it

`ServiceShowcase` was a statement, a column of prose and a 2x2 grid in one file.
It is now three: `ServiceChapter` (the statement and the prose), `ShowcaseGrid`
(the panels), and a `ServiceShowcase` that composes them. Nothing moved
visually — same markup, same gaps, same square panels, same entrance — and
`ServiceShowcase` stopped being a client component on the way, because
everything needing the browser went into the grid where it belonged.

Two consumers followed: the UX & UI page, and `/work`.

**`/work` sets `[data-invert]` on the section to get it.** The grid's separation
is negative space — no rule between the panels, no frame, no field behind them —
so on ink the gaps are gaps in the dark and the four read as one block. The
gutters are only gutters when the surface behind them is paper. That is one
attribute and no restyling, the same move the homepage's paper sections make.

Known and unchanged: the fixed header is white type and does not know it is over
a mid-page paper section, so it is briefly illegible if you scroll up through
one. `isPaperRoute()` answers per route, not per scroll position. Every paper
section on the homepage has had this since it was built; fixing it means
teaching the header to observe what is under it, which is a bigger change than
any of these sections asked for.

## Chapters, and the one crop that had to be argued with

Services can now carry `chapters` — the same statement-and-column block after
the showcase, two or three of them — so a page with real ground to cover makes
its argument in prose rather than as a checklist with the interesting parts left
as bullets. Only the two web pages use them.

`ShowcaseMedia` images gained an optional `position`. Exactly one source needed
it. `south-downs-enquiry.png` is 1402 wide against a 1122 square window, and its
two halves — a title card and a phone — use every pixel of that width, so a
centred crop takes 140px off the left and the S of "Simple" with it. That reads
as a mistake. At `25% 50%` the wording is whole and the phone bleeds off the
right edge instead, which reads as a picture continuing past its frame. There is
no position that keeps both; this is the least-bad one, chosen by rendering all
three and looking.

The eight new gallery files were copied to `public/work/gallery/` and
`public/work/ux-ui-design/` rather than referenced where they landed — see the
`&` note above. That trap is now three for three.

## "Cut off at the right" was the crop, not the container

Reported as the gallery overflowing its parent. It is not, and it is worth
recording how that was established rather than assumed.

Measured on `/work`, `/services/ux-ui-design`, `/services/web-design-development`
and `/services/ai-design`, at 1920 / 1440 / 1366 / 1024 / 768 / 390: the grid is
exactly its parent's content box at every one, both columns are identical to the
pixel, the left and right gutters are equal (32px desktop, 20px at 390), and
`document.scrollWidth === clientWidth` throughout. `sm:grid-cols-2` compiles to
`repeat(2, minmax(0, 1fr))` and `box-sizing: border-box` is global, so the two
usual causes were already covered.

**The cause is `object-cover` on landscape sources in a square tile.** A 1.25:1
picture in a 1:1 box gives up a fifth of its width, taken off both edges. That
looks exactly like clipping and is not: the tile is where it should be, the
picture inside it is cropped. `/work` never had it — all four of those sources
are 2000x2000 and lose nothing.

So the grid takes an optional `ratio`, defaulting to `aspect-square` so every
existing page is untouched, and the AI page sets `aspect-[5/4]` because its
whole set is 1.25:1 or wider. Two of its four now fit to the pixel and the
remaining crop lands on the two abstracts, where there is no subject to lose.

One ratio for all four, still. A per-panel ratio would fit every source and lose
the alignment that makes four panels read as one sequence.

**The UX and UI set was settled the other way, and better: the artwork was
re-cut.** Its three landscape panels were replaced with square recompositions of
the same three subjects, so every source there is now 1:1 against a 1:1 tile and
`object-cover` has nothing left to crop — no `position` override on any panel,
no `contain`, no page-level exception. Where you can change the source, change
the source; steering a crop is what you do when you cannot.

`south-downs-app.png` stayed on disk through that swap even though the grid no
longer points at it — the homepage service carousel still uses it as the UX and
UI card art, tuned to its 1391x1131 shape. The other two outgoing files had no
remaining references and were deleted.

Two of the replacements then needed trimming, both in the pixels rather than in
CSS. A scale-and-nudge would have had to hold at every tile size and resamples
the whole picture to hide a few pixels; a crop is exact and costs nothing.

- **`enquiry-sheet.png`** sat on a pure-white canvas — 24px left, 32px right and
  bottom, 29px top — so its black and yellow artwork rendered visibly inset
  while the other three reached their edges. The trim takes the canvas *and the
  artwork's own corner radius*: a ~68px radius on the left corners would
  otherwise leave white slivers inside the tile's own `rounded-xl`. Cut 1872
  square; zero border pixels are now white and the corners read 25 / 157 / 26 /
  158.
- **`loading-options-spec.png`** had a 1px dark line baked into its last column
  and last row — mean luminance 2 and 136 against an interior of 245 — which is
  the "unintended border down the right and along the bottom". Nothing in CSS:
  no border, no shadow, no background. Cut to 1997 square, three pixels clear.

Originals are still in the `&` staging folder, so either can be re-cut.

## The image optimiser caches by URL, so replacing a file in place serves stale

Worth knowing, because it wasted a diagnostic round. Both files above were
overwritten under their existing names. `next start` then kept serving the
**old** optimised variants out of `.next/cache/images`, which is keyed on the
URL, the width and the quality — none of which changed.

The symptom was maddening: the tile's centre pixel was correct and its edges
were not, at 1440 but not at 768 or 390. That is exactly what a partially warm
cache looks like — the width variants that had been requested before were stale,
the ones that had not were fresh. `rm -rf .next/cache/images` and a restart
resolved it, and the same measurements then passed at every width.

A production deploy starts with an empty cache, so this is a local trap rather
than a shipping bug. But if a served image is ever replaced in place and looks
unchanged, clear that directory before believing anything.

Two measurement traps came with it, both of which produced confident nonsense:

- `elementHandle.screenshot()` rounds the element box outward, so the capture
  includes a sliver of the page. Sampling row 0 of that image samples the white
  gutter, not the tile, and reports every tile as inset. Screenshot the viewport
  and index by device pixel instead.
- Index with `ceil` on the near edges and `floor` on the far ones. Tile tops
  land on fractional CSS positions — 111.69 and 807.69 at 1440 — so `round`
  samples the device row *above* the tile and reports a white inset on all four
  tiles at once, including ones nothing had touched.

`w-full min-w-0 max-w-full` was added to the grid and the tiles anyway. It fixes
nothing measurable today; it is there so that dropping this grid into a flex
parent — where the default `min-width: auto` lets a wide child push past its
container — cannot reintroduce the thing everyone assumes is already happening.
`overflow-hidden` stays on the tile, where the rounded corner needs it, and
never on the section.

## The AI page

Two subjects on one page, deliberately: using AI in the creative process, and
designing products that use it. They are the same argument from either end — a
model produces far more than it judges, so the judgement has to come from
somewhere, whether that is a designer choosing between fifteen directions or an
interface telling someone when not to trust an answer.

Four chapters, on paper, with the showcase grid between the headline and them.

The four panels are **generated studies and are described as such in their alt
text.** They are exploration, which is what the page is about. They are not
client work and must not be captioned as though they were — the page makes no
claim it cannot support, which was an explicit requirement and is worth keeping
if the copy is ever revised.

The filenames were changed on the way in (`AI 2.png` to `generative-lattice.png`
and so on). Not cosmetic: the source folder is the `&` staging area, and spaces
plus mixed case in a path that is fine on Windows and case-sensitive on the
deploy host is the same class of bug caught twice already.

No new CTA was added. The shared service template already carries "Build a full
scope" in the phase box, the header carries "Start a project" and the footer
carries "Get in touch" — all three render on this page. A closing CTA block
would have been a change to all seven service pages, not to this one.

## The product page, and why it needed no new code

`digital-product-design` is the fourth page on paper, with a showcase, four
chapters and the shared grid. **Nothing was built for it.** `paper`, `showcase`,
`chapters`, `metaTitle`/`metaDescription` and the masked heading reveal are all
already data on `Service`, and `app/services/[slug]/page.tsx` already renders
each one — so the redesign is a single entry in `lib/services.ts` and four
files in `public/`. `isPaperRoute()` derives from the same data, so the header
inverted over the white page without being told.

Its grid is the first with a **moving panel outside the web page**, and that
needed nothing either: `ShowcaseMedia` has carried a `video` kind since the
merged web page, and `ShowcaseVideo` already handles autoplay, muted, loop,
`playsInline`, no controls, `object-cover`, the fade-in on first decoded frame
(a `<video>` with nothing decoded is a black rectangle), the upgrade from
`preload="metadata"` to `"auto"` once the grid is reached, and pausing on a held
frame under reduced motion. Adding a filename special case would have been the
wrong instinct twice over.

**All four sources are 1:1** — 2000², 952², 2000² and 1254² — so the square tile
crops nothing and no panel needs a `position`. That is the lesson from the two
grids that had to be argued with, applied at the asset end instead of the CSS
end: the cheapest fix for "cut off at the edges" is a source that matches the
tile.

**The clip is 29.6MB for 59.8s at 952².** It plays, it loops, and the deferred
`preload` means nobody who does not scroll to it pays for it — but that is still
a large autoplaying download next to `levant.mp4` at 637KB, and 952² is soft for
a panel that reaches ~920 CSS px at 1920. Worth a transcode (shorter loop, ~2Mbps,
1600² or better) before this is anything but a preview. `ffmpeg` is not on this
machine, which is why it was not done here. `345308.jpg` sits in the staging
folder and looks like the matching still if a `poster` is ever wanted.

### Two traps in verifying it, both in the test rather than the page

`document.body.innerText` returns text **with `text-transform` applied**, and
`.mono` is uppercase — so every eyebrow, label and pill reads as caps. Assert
case-insensitively or three true things look broken at once.

Seeding `sessionStorage["puzzle:intro-seen"]` to skip the loader makes React log
one hydration-attribute warning on **every** route, because the loader stamps
`data-intro-seen` on `<html>` from a value the server could not know. Confirmed
against `/`, `/services/brand-identity` and `/services/ai-design` with the seed
removed: zero errors everywhere. It is the harness, not the site, and real
visitors never set it before first paint.

## The coverflow, and the five things that had to change to land it

`components/ui/CoverflowCarousel.tsx` is a **supplied implementation**, not one
written here. The transform system is untouched: fractional centre position,
card pitch, index folding, the `Math.pow(distance, falloff)` ramp, the 82°
tilt cap, the edge fade, the flick carry capped at two cards, the 0.16
exponential settle. Do not "tidy" that maths — it is the thing that was asked
for, and the rake is tuned by it.

It arrived written against a different stack, so five things changed and only
these: `cn` (added as `lib/utils.ts` — a filter and a join, not clsx +
tailwind-merge, because nothing here needs conflict resolution); `lucide-react`
(not a dependency, so the two chevrons are inline SVGs with the same `size-5`
API, and they only render behind `showNavigation`); the shadcn colour tokens
(`bg-muted` → `bg-surface-raised`, `text-foreground` → `text-content`,
`bg-background/70` → `bg-surface/70`, so it inverts with `[data-invert]` like
everything else); `outline-none ring-ring` (dropped — `globals.css` already
gives every `:focus-visible` a 2px blue outline, and suppressing it would have
taken the keyboard affordance off the one element that needs it); and
`animate-in fade-in`, which needs a plugin that is not installed.

**Reduced motion** removes the settle only. The rake, the drag and the keyboard
are layout rather than animation, so they stay; under the preference navigation
lands on the target frame instead of easing to it. The flag is read through a
ref so honouring it does not rebuild `settle` and cancel an in-flight rAF.

**Placement is data, not a slug check.** `Service.carousel` carries
`afterChapter`, and the chapters map in `app/services/[slug]/page.tsx` renders
the carousel after that index — so it sits between "Speed without judgement is
just more noise" and "If the product thinks, the interface has to explain"
because the number says 1, not because the template knows about AI. Dropped in
as a sibling of the chapters it inherits their `gap-24 md:gap-32`, which is
where its whitespace comes from: no wrapper, no panel, no background, no rule.

`cardWidth="clamp(240px, 30vw, 430px)"` rather than the component's 22vw
default. At 1440 the run is 1376px wide and 430px cards on a 1.05 pitch put both
neighbours fully on screen at 1332px. The 240px floor keeps the centre card
usable at 390, where the neighbours fall outside the frame and are clipped by
the frame's own `overflow-hidden` — which is why there is no page overflow at
any width.

**Slide count decides how deep the rake reads.** With `loop` on, a card is
teleported across the ring at exactly half a turn out, so `edge` fades it to
zero at `count / 2`. It ran on four to begin with, which showed three — centre
plus one either side — and looked thin. It now carries **seven** studies of its
own in `public/work/ai-design/carousel/`, which shows all seven: centre plus
three receding on each side. Four is the floor; below that the effect collapses.

Those seven are separate from the four in the 2×2 grid above, deliberately —
the grid ran the same images twice on one page while there was nothing else to
use. Six of the seven are 1:1; `filigree-cathedral.png` is 1148×1371 and the
square card centre-crops it, which costs the top of the spire. `CoverflowSlide`
has no per-slide `object-position` and adding one would mean editing the
supplied component, so it is left centred.

## The ribbon between Exploration and Judgement

`components/ui/Marquee.tsx` is a second supplied component, kept as it arrived.
It needed **no new keyframes**: the site already had `@keyframes marquee` for
the clients rail, the services panels and the process timeline, all using the
same duplicated-track, translate-by-`-50%` trick. Only the two class names the
component asks for were added beside those keyframes — `.animate-marquee` (the
`animation` shorthand, reading `--duration`) and `.animate-marquee-reverse`.

**Reverse is `animation-direction`, not a second `animation` shorthand.** The
component applies *both* classes when `direction="right"`, so anything that
re-declared `animation` would be resolving the conflict on stylesheet order.
Different property, no contest.

Two things are passed at the call site rather than changed in the component:

- `style={{ marginTop: 0 }}` cancels its own `mt-10 sm:mt-24`. The chapters grid
  already puts 128px either side of any child, and the two stacked would have
  floated the ribbon in a gap twice the size of every other break on the page.
  Inline, not a class, because `cn` here is a plain join — two competing margin
  utilities would be settled by stylesheet order, not by argument order.
- `className="[&>div]:mx-auto"` centres the inner track. It is capped at `90vw`
  by the component, which at 1440 is 1296px inside a 1376px column — left-
  aligned it died 80px short on the right while touching the left.

`aria-hidden` on the whole strip: the track is rendered twice, so without it a
screen reader reads the eight verbs and then reads them again. They are
decorative — the argument they illustrate is in the two chapters either side.
Note that `innerText` is **not** the way to check this; it reflects rendering,
not the accessibility tree. `locator.ariaSnapshot()` is (and `page.accessibility`
no longer exists in this Playwright).

Placement is the `carousel` pattern again — `Service.marquee.afterChapter`, set
to 0. Six other service pages were checked and carry none.

### A parsing trap when testing it

The browser rewrites `calc(-50% + -452px)` as `calc(-50% - 452px)` on the way
into `style.transform`. A regex expecting a signed number silently returns null
for every card left of centre, which looks like the layout has collapsed. Read
the sign as an operator.

## Motion and video is gone, and Brand Identity got a grid

**Removing the service was one deleted array entry.** The header dropdown, the
mobile nav, the footer, the services index, the homepage cards, the scope
builder, the contact form and `generateStaticParams` all read `SERVICES`, so
nothing else needed touching. Four things did not derive from it and were fixed
by hand: the hardcoded "Seven ways we can help" on `/services` (now six), a
`[motion and video](/services/motion-video)` link inside
`the-tenth-screen`, the `motion-video` key in the homepage `ART` map, and a
308 to `/services` in `next.config.ts`. No successor page, so it lands on the
index rather than pretending one service replaced it.

Five files under `public/work/services/` are now unreferenced —
`brand-identity`, `web-design`, `web-development`, `digital-product-design` and
`motion-video`. Left on disk deliberately; deleting them is a separate decision.

**The homepage cards now show work from the pages they link to.** Only the UX
and UI card did before; the rest pointed at generic stock. They are also chosen
to stay distinct from one another — stationery, a phone on coral, a machine
search, a laptop, a generated abstract — because five variations of a screen on
a desk read as one repeated card sliding past. `object-position` still matters
and is set per card: landscape sources crop horizontally, square ones crop
vertically, so which number does the work depends on the source.

**Brand Identity is now `paper: true`**, and that is not a style preference.
The grid's gutters are the page showing through rather than a drawn divider, so
the white cross between the four tiles only exists on a light surface — the
requirement was that it match the other four galleries exactly, and on ink it
cannot. Its grid is `aspect-[5/4]`: three sources are 1.25:1 and fit to the
pixel, and the crop that remains falls on the clip.

### The clip is not the one on the product page

`345308 (2).mp4` in the staging folder **was replaced** between the product page
work and this. The old one was 29.6MB and 59.8s of foliage over the Bespoke
Garden Decor homepage; the new one is 1.7MB and 6.5s of the LEVANT drop 001
campaign. Different footage, not a re-encode — so
`digital-product-design/interface-motion.mp4` still holds the original and
**still weighs 29.6MB**. That is the one outstanding performance problem on the
site. Do not assume the two are interchangeable: the file name was reused, the
content was not. This one is named `levant-campaign-film.mp4` for that reason.

## The homepage cards went portrait, and the hero grew

`aspect-[16/9] w-[88vw] sm:w-[44vw] lg:w-[29vw]` became
`aspect-[4/5] w-[64vw] sm:w-[34vw] lg:w-[22vw]` on the card `<li>` in
`ServicesPanels`. That one class list is the whole change; `sizes` was updated
to match so the optimiser still fetches for the box it draws into.

**The width had to come down with the ratio, not just the height go up.** The
hero is `min-h-svh` with the rail taking whatever is left, so height added to a
card is height added to the hero. At the old 29vw a 4:5 card is 696px tall on a
1920 display. 22vw buys most of that back and puts 4.5 cards on screen instead
of 3.4, which suits a strip that is already moving.

**It still costs hero height, and that is the trade-off to know about.** The
hero now runs past the viewport by roughly 165–260px on desktop where it was
0–110px, so the standfirst and the scroll counter sit below the fold on a short
laptop. There is no arrangement that keeps a 4:5 card, a full headline, a CTA
and the standfirst inside one screen — the only levers are narrower cards or
less hero. Left as asked; revisit by dropping `lg:w-[22vw]` to about 18vw if
the fold matters more than the card size.

**The crop flipped axis.** Every source is 1:1 or wider and the box is now 0.8,
so `object-cover` fits to height and crops horizontally on all five — the
opposite of before. The first number of each `position` in the ART map is now
the one doing the work; the second is inert.

Speed did not need touching: `useMarqueeRail` derives `--cycle` from the
measured track at a fixed `PX_PER_SECOND`, so a narrower track simply produced
a shorter cycle (31.8s against 56s) at the same travel rate.

### Two measurement traps, both in the test rather than the page

A `fill` image inside a card with `border border-rule` is `inset-0` on the
*padding* box, so the picture is exactly 2px smaller than the card in each
axis. That is not a letterbox.

`getBoundingClientRect()` on a 3D-rotated element returns its **projected** box
— the coverflow's raked neighbours measure 0.84 while being perfectly square.
Use `offsetWidth`/`offsetHeight` when the question is about the element rather
than about what it covers on screen.

## The retainer page, and the second grid

The retainer was already a service with a stub page. It now carries the fullest
editorial run on the site: a showcase, **two** `ShowcaseGrid`s with the shared
coverflow between them, and eight chapters.

`Service.grid2` is the new field — the third to take `afterChapter`, alongside
`carousel` and `marquee`, and it works identically. One `ShowcaseGrid` under
the opening statement, another dropped in after a chapter, both inheriting the
chapters grid's `gap-24 md:gap-32`. No wrapper, no ratio of its own.

**Fifteen assets, all referenced where they already live.** Nothing was copied
into a retainer folder — the whole point of the page is that the studio's
existing work is the evidence. Zero AI Design imagery anywhere on it, which was
an explicit requirement and is asserted rather than assumed.

**Two pairs of files on this site are byte-identical**, which matters when
picking a spread that must not repeat itself:

    gallery/bespoke-garden-decor-products.png  ==  web-design/bespoke-garden-decor.png
    ux-ui-design/south-downs-app.png           ==  web-design/south-downs.png

Found by hashing, not by looking — the filenames give no hint. There are 12
distinct 1:1 sources on the site, not the 14 the directory listing suggests,
which is why both retainer grids are square and use the pool carefully.

`SHOWN` in `ServicesPanels` was `SERVICES.slice(0, 5)`. That slice meant "all
except the retainer" and existed only because the retainer had nothing worth
linking to. It is now plain `SERVICES`, so a service added to the data appears
on the homepage without touching that file — it only needs an `ART` entry.

## About, rebuilt — and the FAQ that now runs site-wide

The old About page was ~900 words of body copy with nothing to look at. Every
argument it made is still there; most of it is now carried by a component. What
went: "Why we exist" (three paragraphs) became one statement plus the sticker
row; "How we show up" (four numbered principles) became the three engagement
cards; "The journey" was cut outright, because it restated the process every
service page already publishes phase by phase. **`components/about/AboutJourney.tsx`
is now orphaned** — left on disk deliberately, deleting it is a separate call.

### The results graphic, and why it charts a schedule

The supplied component arrived with placeholder bars — 35/25/99/37 against
"competitor 1..4", labelled *conversions*. Those are gone and were **not**
replaced with invented equivalents.

**There is no defensible performance data in this repository.** `lib/work.ts`
says so itself: its `outcomes` are deliberately non-numeric ("Launched on
schedule", "Clearer buying journey") and the comment above them states that
sell-through and the like are "the client's data to publish, not ours". So the
chart uses the one honest set of figures the site already publishes — the
`digital-product-design` phase breakdown, 2/3/3/2 across ten weeks — and the
section argues from it. A test asserts the four values in the component match
`lib/services.ts` exactly, so the two cannot drift.

Everything else about the supplied design is intact: candy-striped track, spring
bar, NumberFlow, the callout with its dot and tail, the stagger. What changed:
`framer-motion` → `motion/react` (same library, current name); the unused
`CirclePercent` import removed rather than installing `lucide-react`;
`lg::text-6xl` (a stray second colon that silently disabled the large size);
shadcn tokens mapped to the semantic layer; entrance moved to `useInViewOnce`
so it plays when reached rather than on mount.

`@number-flow/react` is the one dependency added.

### Two things that bit

**The callout overflowed the document on a phone.** It is ~150px wide and a bar
at 390 is ~78px, so centring it pushed 14px past the edge — real, measured, and
invisible until something checks `scrollWidth`. Hidden below `sm`; the blue bar
carries the emphasis on its own at that size.

**NumberFlow keeps every digit 0-9 in a shadow reel** and translates the right
one into view, so `textContent` on the host is empty and the DOM cannot tell you
which figure is showing. Assert the element count and check the values at
source instead of trying to read them off the page.

### FAQ

One component, `components/ui/FAQ.tsx`, used by About and all six service
pages, with content in `lib/faqs.ts`. `FaqJsonLd` takes the *same array* the
section renders, so the `FAQPage` schema cannot drift from what is on screen —
tested per page. Questions are `<h3>` wrapping a real `<button>` with
`aria-expanded`/`aria-controls`; the panel is removed when closed, not hidden.

Every question is unique across all seven pages. That is asserted, and it caught
a genuine duplicate — "Do you create prototypes?" was in both the UX/UI and
digital product sets.

## Contact channels, and the two values that are missing

`CONTACT_CHANNELS` in `lib/site.ts` holds `whatsappNumber` and `facebookUrl`,
**both `null`**. There is no Puzzle phone number and no Facebook page anywhere
in this repository — searched for `+44`, `tel:`, `wa.me` and "facebook" across
every `.ts`, `.tsx`, `.md` and `.json` — so there is nothing to build a `wa.me`
link out of and nothing to point a Facebook icon at.

Everything downstream checks first and renders **nothing** when the value is
missing: the two new footer icons, `WhatsAppCta`, and the four places that
place a WhatsApp strip. Fill either value in and all of them light up at once;
that is the only change needed. `whatsappHref()` builds the link (digits only,
message percent-encoded) from the one central value, so no component knows a
number.

Worth saying explicitly: the number printed on the cards in
`/work/brand-identity/puzzle-stationery.png` is `+44 20 7946 xxxx`, which is
Ofcom's reserved range for drama and fiction. It is mockup artwork. It is not a
contact and must never be wired up.

**`SITE.social` still points Instagram and LinkedIn at `https://instagram.com`
and `https://linkedin.com`** — the bare sites, not Puzzle accounts. Those were
already there; they are placeholders too.

## Scope enquiry: the plumbing already existed

The brief asked for the selected scope to be carried into the enquiry rather
than discarded. It already was: `ScopeBuilder.send()` pushes
`/contact?scope=<slugs>&weeks=<n>`, `ContactForm` reads both from the query,
prefills the message, and posts `scope` and `estimatedWeeks` as their own
Formspree fields. What was missing was any sign of it on screen, so the three
steps are now labelled — 01 build, 02 review, 03 send — and the button says
"Send my scope".

`ContactForm` already had `idle | submitting | success | error`, disabled its
submit while in flight, and refused to send at all without
`NEXT_PUBLIC_FORMSPREE_ID`. None of that was touched. **That env var is still
unset**, so submitting shows the "not configured" state rather than pretending.

## Open / needs input

- **Brand PNGs are absent.** `5.png`, `7.png`, `8.png`, `10.png` were never on
  this machine. The loader did not need `5.png` — §5 supplied the path data
  verbatim. LEVANT will be built on placeholder imagery at the right aspect
  ratios, with all paths centralised so a swap is a file drop.
- **Hero background video** — brief calls for full-bleed muted video. No asset;
  currently flat ink.
- **Formspree** — `NEXT_PUBLIC_FORMSPREE_ID` not set yet; submit will be disabled
  and show a "not configured" state rather than faking a send.
- **Client logos** for the marquee — placeholders planned.
- Git identity was unset globally; set locally on this repo only. Change it if
  you want commits attributed differently.
