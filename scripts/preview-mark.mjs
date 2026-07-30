/**
 * Dev-only visual check: rasterises the generated logo/icon onto an ink
 * background so the mark's shape and seam can be eyeballed without a browser.
 * Not part of the build. Output is gitignored.
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".preview");
mkdirSync(out, { recursive: true });

const INK = { r: 15, g: 15, b: 18, alpha: 1 };

for (const [name, size] of [
  ["logo", 720],
  ["icon", 720],
]) {
  const svg = readFileSync(join(root, `public/${name}.svg`));
  await sharp(svg, { density: 300 })
    .resize(size, size, { fit: "contain", background: { ...INK, alpha: 0 } })
    .flatten({ background: INK })
    .png()
    .toFile(join(out, `${name}.png`));
  console.log(`.preview/${name}.png  ${size}x${size}`);
}
