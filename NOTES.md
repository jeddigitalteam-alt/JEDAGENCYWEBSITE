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

`components/brand/puzzle-paths.ts` is the single source of truth. `PuzzleMark.tsx`,
`public/logo.svg`, `public/icon.svg` and the loader all read from it.

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
- route change → the diagonal the wipe parts on (`SeamPanels`, shared component)
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
