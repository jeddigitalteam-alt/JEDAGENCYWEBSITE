/**
 * Favicons, rendered from the one piece of source artwork.
 *
 * `public/icon.svg` is the Puzzle mark on its own — the puzzle piece, no
 * wordmark — which is the only version that survives being drawn at 16px. Every
 * raster below is rendered from it, so there is one drawing of the mark in this
 * repository and the favicons cannot drift from it.
 *
 * Run with: node scripts/gen-favicons.mjs
 *
 * Why rasters at all, when the SVG is sharper at every size: Google's favicon
 * crawler fetches `/favicon.ico` by path, and the format it is happiest with is
 * a real ICO. Its guidance also asks for at least 48x48. So the SVG stays as
 * the modern browser icon and the rasters exist for everything else.
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const SRC = "public/icon.svg";

/** Density high enough that the 512 render is sampled up, never up-scaled. */
const DENSITY = 900;

/** Puzzle's paper white — see `--paper` in app/globals.css. */
const PAPER = { r: 255, g: 255, b: 255, alpha: 1 };

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/**
 * Render the mark square at `size`.
 *
 * `flatten` rather than a `resize` background: the source is square and so is
 * the target, so `fit: "contain"` letterboxes nothing and a background passed
 * to `resize` is never painted. Composited icons have to be flattened
 * explicitly or they come out with the transparency they started with.
 */
async function render(size, background) {
  const pipeline = sharp(SRC, { density: DENSITY }).resize(size, size, {
    fit: "contain",
    background: TRANSPARENT,
  });
  return (background ? pipeline.flatten({ background }) : pipeline)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Pack PNGs into an ICO.
 *
 * An ICO is a 6-byte header, then one 16-byte directory entry per image, then
 * the payloads. Modern browsers read PNG payloads directly, so the images go in
 * as-is rather than being re-encoded as BMP — which is what keeps the alpha
 * channel clean at 16px.
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
  return Buffer.concat([
    header,
    ...entries,
    ...images.map((i) => i.data),
  ]);
}

/* The ICO carries the three classic sizes. 48 is there because that is the
   floor Google asks for, and it is the one a search result actually uses. */
const icoSizes = [16, 32, 48];
const icoImages = [];
for (const size of icoSizes) {
  icoImages.push({ size, data: await render(size, null) });
}
await writeFile("public/favicon.ico", ico(icoImages));

/* Standalone PNGs. 48 is Google's stated minimum; 192 and 512 are the two
   sizes a web app manifest and Android home screens ask for. */
for (const size of [48, 192, 512]) {
  await writeFile(`public/icon-${size}.png`, await render(size, null));
}

/* Apple's touch icon is composited onto black when it has an alpha channel, so
   this one is flattened onto paper white rather than left transparent. 180 is
   the size current iOS asks for. */
await writeFile("public/apple-icon.png", await render(180, PAPER));

console.log(
  `favicon.ico (${icoSizes.join(", ")}) · icon-48/192/512.png · apple-icon.png (180, on paper)`,
);
