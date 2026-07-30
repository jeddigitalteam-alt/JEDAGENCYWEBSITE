# Gilroy — wordmark font

The "puzzle" wordmark (header lockup and large footer wordmark) is set in
Gilroy. Drop the licensed webfont files into **this folder** and they are
picked up automatically — no code change needed.

## Files expected

```
public/fonts/gilroy/
├── Gilroy-Regular.woff2
└── Gilroy-Bold.woff2      ← the wordmark uses this one
```

Filenames must match exactly. They are referenced from the `@font-face` blocks
in `app/globals.css`.

If you also want Medium or ExtraBold, add the file here and a matching
`@font-face` block with the right `font-weight` in `app/globals.css`.

## Converting from OTF/TTF

If your licence pack ships desktop formats, convert to woff2 first — it is
roughly 30% smaller and is the only format worth serving to current browsers:

```bash
# https://github.com/google/woff2
woff2_compress Gilroy-Bold.otf
```

Or use the Fontsquirrel / Transfonter web converters if you'd rather not build
the tool.

## Licence

Gilroy is a commercial typeface by Radomir Tinkov. **Self-hosting it on a public
site requires a webfont licence** — a desktop licence alone does not cover
serving the files to visitors. Buy the webfont licence for the expected traffic
tier before this goes live.

This folder is intentionally empty of font files: none were supplied, and they
are not ours to redistribute.

## What happens until the files are here

`@font-face` lists `local()` first, so an installed desktop copy of Gilroy will
be used on machines that have one. Otherwise the declaration fails to resolve
and the wordmark falls back to **Geist** — a geometric grotesque, so it degrades
to something close in character rather than to the serif used for headlines.

You'll see one 404 per weight in the browser console until the files land. That
is the expected, visible signal that they are still missing.
