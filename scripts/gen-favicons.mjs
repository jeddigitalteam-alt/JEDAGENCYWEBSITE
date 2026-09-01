/**
 * Favicons, rendered from the one piece of source artwork.
 *
 * This script OWNS `public/icon.svg`. It writes it, then renders every raster
 * from it, so there is one drawing of the favicon in this repository and the
 * icons cannot drift from it.
 *
 * Run with: node scripts/gen-favicons.mjs  (npm run gen:favicons)
 *
 * THE MARK IS THE SINGLE PIECE. Geometry comes from
 * components/brand/puzzle-site-mark.ts — the same path the header and footer
 * logo draw, traced from the supplied artwork. It is imported rather than
 * copied, so the favicon and the site logo are the same shape by construction.
 *
 * `scripts/gen-logo.mjs` used to write `public/icon.svg` too, from the
 * two-piece decorative geometry in puzzle-paths.ts. That is what put the old
 * interlocking mark in the browser tab and in Google's favicon cache. It no
 * longer writes this file; it owns `public/logo.svg` alone.
 *
 * TREATMENT: brand-blue square, piece body in the SAME blue, white keyline.
 * The field and the body being one colour is the point — the piece is read
 * entirely by its white outline, which is the footer treatment described in
 * components/brand/PuzzleSiteLogo.tsx. The keyline keeps the artwork's own
 * ratio; it is not thickened to survive 16px, because that would be a redraw.
 *
 * Why rasters at all, when the SVG is sharper at every size: Google's favicon
 * crawler fetches `/favicon.ico` by path, and the format it is happiest with is
 * a real ICO. Its guidance also asks for at least 48x48. So the SVG stays as
 * the modern browser icon and the rasters exist for everything else.
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import {
  SITE_MARK_PATH,
  SITE_MARK_KEYLINE,
} from "../components/brand/puzzle-site-mark.ts";

const SRC = "public/icon.svg";

/** Density high enough that the 512 render is sampled up, never up-scaled. */
const DENSITY = 900;

/** PRIMARY — the puzzle blue. See `--blue` in app/globals.css. */
const BLUE = "#12a8ff";

/** Square side, in viewBox units. The mark is laid out inside this. */
const BOX = 1000;

/**
 * Margin between the outermost edge of the keyline and the edge of the square.
 *
 * Load-bearing, not taste. The field and the piece body are the same blue, so
 * the only thing drawing the piece is its white outline — let that run to the
 * edge and the square clips it, and the silhouette stops closing. 6% is enough
 * to keep the outline whole while leaving the mark as large as possible, which
 * is what gives the keyline the most pixels to survive in at 16px.
 */
const INSET = 60;

/**
 * Bounding box of the mark, keyline included.
 *
 * Computed from the path rather than hardcoded, so it cannot fall out of step
 * with the artwork. SITE_MARK_PATH is polygonal — M, L and Z only — so every
 * number in it is an on-curve coordinate and min/max over the pairs is exact.
 * The assertion below is what keeps that true: add a curve to the artwork and
 * this fails loudly instead of silently mis-centring the icon.
 */
function markBounds() {
  const commands = new Set(SITE_MARK_PATH.match(/[A-Za-z]/g));
  for (const c of commands) {
    if (!"MLZmlz".includes(c)) {
      throw new Error(
        `SITE_MARK_PATH now contains '${c}'. This bounds calculation assumes ` +
          `a polygonal path (M/L/Z only) — teach it curves before using it.`,
      );
    }
  }
  const nums = SITE_MARK_PATH.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  /* The keyline is a centred stroke, so it overhangs the contour by half its
     width on every side. */
  const halo = SITE_MARK_KEYLINE / 2;
  return {
    x: Math.min(...xs) - halo,
    y: Math.min(...ys) - halo,
    w: Math.max(...xs) - Math.min(...xs) + SITE_MARK_KEYLINE,
    h: Math.max(...ys) - Math.min(...ys) + SITE_MARK_KEYLINE,
  };
}

/** The favicon artwork: blue square, blue piece, white keyline. */
function iconSvg() {
  const b = markBounds();
  const inner = BOX - 2 * INSET;
  /* Uniform scale on the larger axis, so the mark fits the inner box whichever
     way round it is, and the shorter axis is centred in what is left. */
  const scale = inner / Math.max(b.w, b.h);
  const tx = INSET + (inner - b.w * scale) / 2 - b.x * scale;
  const ty = INSET + (inner - b.h * scale) / 2 - b.y * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">
  <title>Puzzle</title>
  <rect width="${BOX}" height="${BOX}" fill="${BLUE}"/>
  <g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(6)})">
    <path d="${SITE_MARK_PATH}" fill="${BLUE}" stroke="#FFFFFF" stroke-width="${SITE_MARK_KEYLINE}" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke"/>
  </g>
</svg>
`;
}

await writeFile(SRC, iconSvg());

/**
 * Render the mark square at `size`.
 *
 * No `flatten` anywhere below: the artwork carries its own opaque blue square,
 * so every render is already fully opaque — including Apple's touch icon,
 * which is the one that would otherwise be composited onto black.
 */
async function render(size) {
  return sharp(SRC, { density: DENSITY })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Pack PNGs into an ICO.
 *
 * An ICO is a 6-byte header, then one 16-byte directory entry per image, then
 * the payloads. Modern browsers read PNG payloads directly, so the images go in
 * as-is rather than being re-encoded as BMP.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette size, 0 for truecolour
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

/* The ICO carries the three classic sizes. 48 is there because that is the
   floor Google asks for, and it is the one a search result actually uses. */
const icoSizes = [16, 32, 48];
const icoImages = [];
for (const size of icoSizes) {
  icoImages.push({ size, data: await render(size) });
}
await writeFile("public/favicon.ico", ico(icoImages));

/* Standalone PNGs. 48 is Google's stated minimum; 192 and 512 are the two
   sizes a web app manifest and Android home screens ask for. */
for (const size of [48, 192, 512]) {
  await writeFile(`public/icon-${size}.png`, await render(size));
}

/* 180 is the size current iOS asks for. */
await writeFile("public/apple-icon.png", await render(180));

console.log(
  `icon.svg (single piece, blue field) · favicon.ico (${icoSizes.join(", ")}) · ` +
    `icon-48/192/512.png · apple-icon.png (180)`,
);
