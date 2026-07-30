/**
 * Generates marked placeholder imagery for the work grid and the LEVANT case
 * study, at the aspect ratios the real assets need.
 *
 * These exist because the four brand PNGs named in the brief (5/7/8/10.png)
 * were not available. Every file is visibly labelled PLACEHOLDER so none of
 * them can be mistaken for delivered artwork. Paths are centralised in
 * lib/work.ts — replacing these is a file drop, no code change.
 *
 * Run: npm run gen:placeholders
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public/work");
mkdirSync(join(pub, "levant"), { recursive: true });
mkdirSync(join(pub, "placeholder"), { recursive: true });

const INK = "#0F0F12";
const RAISED = "#1B1D21";
const BLUE = "#12A8FF";
const CLAY = "#B4441E";
const CORAL = "#FF9B79";
const DIM = "#E0E0E0";

/** Diagonal seam motif — the structural signature, not a decorative sprinkle. */
function seam(w, h, stroke, opacity = 0.5) {
  const step = Math.round(Math.max(w, h) / 7);
  let out = "";
  for (let i = -h; i < w + h; i += step) {
    out += `<line x1="${i}" y1="0" x2="${i + h}" y2="${h}" stroke="${stroke}" stroke-width="1" opacity="${opacity}"/>`;
  }
  return out;
}

function plate({ w, h, bg, accent, label, sub, note = "PLACEHOLDER" }) {
  const fs = Math.round(Math.min(w, h) * 0.075);
  const small = Math.max(11, Math.round(Math.min(w, h) * 0.022));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <g clip-path="inset(0)">${seam(w, h, accent, 0.16)}</g>
  <rect x="${w * 0.5 - 1}" y="0" width="2" height="${h}" fill="${accent}" opacity="0.35"/>
  <text x="${w * 0.06}" y="${h * 0.52}" font-family="Georgia, serif" font-size="${fs}" fill="${DIM}">${label}</text>
  <text x="${w * 0.06}" y="${h * 0.52 + fs * 0.95}" font-family="monospace" font-size="${small}" letter-spacing="${small * 0.14}" fill="${accent}">${sub}</text>
  <text x="${w * 0.06}" y="${h * 0.93}" font-family="monospace" font-size="${small}" letter-spacing="${small * 0.14}" fill="${DIM}" opacity="0.55">${note}</text>
</svg>`);
}

const JOBS = [
  // LEVANT — clay comes from the court photography, editorial-only.
  {
    file: "levant/hero.jpg",
    w: 2400,
    h: 1350, // 16:9 — was 8.png
    bg: CLAY,
    accent: CORAL,
    label: "LEVANT",
    sub: "HERO — WAS 8.PNG — IMAC + LAPTOP ON CLAY",
  },
  {
    file: "levant/thumb.jpg",
    w: 1600,
    h: 1200, // 4:3 grid tile
    bg: CLAY,
    accent: CORAL,
    label: "LEVANT",
    sub: "GRID THUMB — 4:3",
  },
  {
    file: "levant/pdp-scroll.jpg",
    w: 1200,
    h: 3000, // tall — scrolls inside the iMac frame; was 10.png
    bg: INK,
    accent: CORAL,
    label: "LEVANT PDP",
    sub: "SCROLLS INSIDE IMAC — WAS 10.PNG",
  },
  {
    file: "levant/lockup.jpg",
    w: 1600,
    h: 900,
    bg: INK,
    accent: BLUE,
    label: "Lockup reference",
    sub: "WAS 7.PNG — ICON + WORDMARK PROPORTIONS",
  },
];

const OTHERS = [
  ["meridian", "Meridian Health"],
  ["northbank", "Northbank"],
  ["kestrel", "Kestrel"],
  ["atlas", "Atlas Freight"],
  ["harbour", "Harbour Goods"],
  ["orbit", "Orbit Labs"],
  ["pellum", "Pellum"],
  ["fieldwork", "Fieldwork"],
  ["sable", "Sable Court"],
  ["verity", "Verity"],
  ["ground", "Ground Station"],
];

for (const [name, client] of OTHERS) {
  JOBS.push({
    file: `placeholder/${name}.jpg`,
    w: 1600,
    h: 1200,
    bg: RAISED,
    accent: BLUE,
    label: client,
    sub: "CASE STUDY — PLACEHOLDER IMAGE",
  });
}

for (const job of JOBS) {
  await sharp(plate(job))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(pub, job.file));
  console.log(`  public/work/${job.file}  ${job.w}x${job.h}`);
}

console.log(`\n${JOBS.length} placeholders written.`);
