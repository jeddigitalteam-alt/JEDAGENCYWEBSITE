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
