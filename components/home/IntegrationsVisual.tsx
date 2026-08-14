"use client";

import { motion, useReducedMotion } from "motion/react";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";

/**
 * The integration lattice that fills the right of the process section.
 *
 * A 5x5 grid with twelve of its twenty-five cells occupied — nine logos and
 * three deliberately empty tiles. The emptiness is the design: it is what makes
 * the block read as a scattered constellation rather than a logo wall, so the
 * gaps are as much a part of the supplied coordinates as the marks are.
 *
 * The occupied cells all satisfy `(row + col) % 2 === 1`, which is why tiles
 * sized to exactly one cell never share an edge — they only ever meet at a
 * corner. That is what lets the tile be the full cell with no gutter maths.
 *
 * The section carries no second heading. The process copy beside it is the
 * text for this whole band; the lattice is the evidence, not a captioned
 * component.
 */

/* Matches ProcessLadder and the site's `--ease-lock`. */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The fade to nothing at the edges.
 *
 * Written as a style rather than a `mask-*` utility so the stops can be tuned
 * against ink specifically, and so the `-webkit-` pair ships together. Three
 * stops, not two: a plateau holding the middle at full strength, a shoulder,
 * then transparent well inside the corners. A straight `black → transparent`
 * ramp starts dimming from the centre pixel and the middle tiles read as
 * greyed rather than lit.
 *
 * Black here is a mask alpha, not a colour — the mask samples luminance and
 * alpha, and nothing of this reaches the page as paint. It is not a brand hex
 * and does not belong in the token layer.
 */
const MASK =
  "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,1) 38%, rgba(0,0,0,0.62) 66%, rgba(0,0,0,0) 92%)";

/**
 * Entrance delay, ordered outward from the middle of the grid.
 *
 * Distance from the centre cell rather than array index: the tiles then arrive
 * as a spread, which is the shape of the thing being drawn. Indexing the array
 * instead reads top-to-bottom, like a list loading. The nearest ring is at
 * distance 1 — there is no tile on the centre cell — so subtracting it starts
 * the first tile at zero rather than holding every tile back by a step.
 */
const delayFor = (row: number, col: number) =>
  (Math.hypot(row - 2, col - 2) - 1) * 0.11;

type LogoType = {
  src: string;
  alt: string;
  /** Single-colour marks drawn in black. They need inverting to survive on
   *  ink; the full-colour marks must not be touched. */
  isInvertable?: boolean;
};

type TileData = {
  row: number;
  col: number;
  logo?: LogoType;
};

function IntegrationCard({ row, col, logo }: TileData) {
  const reduced = useReducedMotion();
  const delay = delayFor(row, col);

  return (
    <motion.div
      /* Positioned off a single `--cell`, so one responsive custom property
         resizes the whole lattice and the supplied row/col coordinates stay
         exactly as supplied at every width. */
      style={{
        left: `calc(var(--cell) * ${col})`,
        top: `calc(var(--cell) * ${row})`,
        width: "var(--cell)",
        height: "var(--cell)",
      }}
      className={
        "group absolute flex items-center justify-center rounded-lg border " +
        (logo
          ? "border-rule bg-surface-raised shadow-[0_1px_2px_color-mix(in_oklab,var(--ink)_40%,transparent)] transition-colors duration-500 hover:border-[color-mix(in_oklab,var(--blue)_42%,var(--rule))]"
          : /* Empty tiles: a hair of structure and nothing else. A visible card
               here would turn the negative space into more content. */
            "border-[color-mix(in_oklab,var(--rule)_55%,transparent)] bg-[color-mix(in_oklab,var(--surface-raised)_40%,transparent)]")
      }
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduced
          ? { duration: 0.2, delay: 0 }
          : { duration: 0.55, delay, ease: EASE }
      }
      aria-hidden={logo ? undefined : "true"}
    >
      {logo ? (
        /* eslint-disable-next-line @next/next/no-img-element -- the sources are
           inline data URIs. There is nothing for the image optimiser to fetch
           or re-encode, and routing a data URI through it is the failure mode
           NOTES.md records for the work assets. */
        <img
          src={logo.src}
          alt={logo.alt}
          width={40}
          height={40}
          /* Sized off the tile, so the marks scale with `--cell` and never
             become microscopic on a phone. */
          className={
            "pointer-events-none size-[42%] select-none object-contain opacity-85 transition-opacity duration-500 group-hover:opacity-100 " +
            (logo.isInvertable ? "invert" : "")
          }
        />
      ) : null}
    </motion.div>
  );
}

export function IntegrationsVisual({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  /* `whileInView` does not fire on this page — see the note in
     `useInViewOnce`. `immediate` under reduced motion is consumed inside the
     hook's effect, so the first render still matches the server. */
  const { ref, seen } = useInViewOnce<HTMLDivElement>({
    margin: "-120px",
    immediate: !!reduced,
  });

  return (
    <div
      ref={ref}
      className={
        /* One custom property drives cell, tile and overall size. The grid is
           5 cells square, so the widest step (5 x 116px = 580px) still leaves
           room inside the column at 1920 and the smallest (5 x 56px = 280px)
           clears a 360px phone with its page padding. */
        "relative [--cell:56px] sm:[--cell:64px] md:[--cell:72px] lg:[--cell:76px] xl:[--cell:92px] 2xl:[--cell:116px] " +
        (className ?? "")
      }
      style={{
        width: "calc(var(--cell) * 5)",
        height: "calc(var(--cell) * 5)",
        maskImage: MASK,
        WebkitMaskImage: MASK,
      }}
    >
      {seen
        ? TILES.map((tile) => (
            <IntegrationCard key={`${tile.row}_${tile.col}`} {...tile} />
          ))
        : null}
    </div>
  );
}

/* Coordinate mapping for the scattered look. Grid 5x5, as supplied. */
const TILES: TileData[] = [
  // Row 0
  { row: 0, col: 1 }, // Empty
  {
    row: 0,
    col: 3,
    logo: {
      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjY4IiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgdmlld0JveD0iMCAwIDI1NiAyNjgiPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNi4wOTIgMTEuNTM4IDE2NC4wOS42MDhjMTguMTc5LTEuNTYgMjIuODUtLjUwOCAzNC4yOCA3LjgwMWw0Ny4yNDMgMzMuMjgyQzI1My40MDYgNDcuNDE0IDI1NiA0OC45NzUgMjU2IDU1LjIwN3YxODIuNTI3YzAgMTEuNDM5LTQuMTU1IDE4LjIwNS0xOC42OTYgMTkuMjRMNjUuNDQgMjY3LjM3OGMtMTAuOTEzLjUxNy0xNi4xMS0xLjA0My0yMS44MjUtOC4zMjdMOC44MjYgMjEzLjgxNEMyLjU4NiAyMDUuNDg3IDAgMTk5LjI1NCAwIDE5MS45N1YyOS43MjZjMC05LjM1MiA0LjE1NS0xNy4xNTMgMTYuMDkyLTE4LjE4OFoiLz48cGF0aCBkPSJNMTY0LjA5LjYwOCAxNi4wOTIgMTEuNTM4QzQuMTU1IDEyLjU3MyAwIDIwLjM3NCAwIDI5LjcyNnYxNjIuMjQ1YzAgNy4yODQgMi41ODUgMTMuNTE2IDguODI2IDIxLjg0M2wzNC43ODkgNDUuMjM3YzUuNzE1IDcuMjg0IDEwLjkxMiA4Ljg0NCAyMS44MjUgOC4zMjdsMTcxLjg2NC0xMC40MDRjMTQuNTMyLTEuMDM1IDE4LjY5Ni03LjgwMSAxOC42OTYtMTkuMjRWNTUuMjA3YzAtNS45MTEtMi4zMzYtNy42MTQtOS4yMS0xMi42NmwtMS4xODUtLjg1NkwxOTguMzcgOC40MDlDMTg2Ljk0LjEgMTgyLjI3LS45NTIgMTY0LjA5LjYwOFpNNjkuMzI3IDUyLjIyYy0xNC4wMzMuOTQ1LTE3LjIxNiAxLjE1OS0yNS4xODYtNS4zMjNMMjMuODc2IDMwLjc3OGMtMi4wNi0yLjA4Ni0xLjAyNi00LjY5IDQuMTYzLTUuMjA3bDE0Mi4yNzQtMTAuMzk1YzExLjk0Ny0xLjA0MyAxOC4xNyAzLjEyIDIyLjg0MiA2Ljc1OGwyNC40MDEgMTcuNjhjMS4wNDMuNTI1IDMuNjM4IDMuNjM3LjUxNyAzLjYzN0w3MS4xNDYgNTIuMDk1bC0xLjgxOS4xMjVabS0xNi4zNiAxODMuOTU0VjgxLjIyMmMwLTYuNzY3IDIuMDc3LTkuODg3IDguMy0xMC40MTNMMjMwLjAyIDYwLjkzYzUuNzI0LS41MTcgOC4zMSAzLjEyIDguMzEgOS44Nzl2MTUzLjkxN2MwIDYuNzY3LTEuMDQ0IDEyLjQ5LTEwLjM4NyAxMy4wMDhsLTE2MS40ODcgOS4zNjFjLTkuMzQzLjUxNy0xMy40ODktMi41OTQtMTMuNDg5LTEwLjkyMVpNMjEyLjM3NyA4OS41M2MxLjAzNCA0LjY4MSAwIDkuMzYyLTQuNjgxIDkuODk3bC03Ljc4MyAxLjU0MnYxMTQuNDA0Yy02Ljc1OCAzLjYzNy0xMi45ODEgNS43MTUtMTguMTggNS43MTUtOC4zMDggMC0xMC4zODYtMi42MDQtMTYuNjA5LTEwLjM5NmwtNTAuODk4LTgwLjA3OXY3Ny40NzZsMTYuMSAzLjY0NnMwIDkuMzYyLTEyLjk4OSA5LjM2MmwtMzUuODE0IDIuMDc3Yy0xLjA0My0yLjA4NiAwLTcuMjg0IDMuNjMtOC4zMThsOS4zNTEtMi41OTVWMTA5LjgyM2wtMTIuOTgtMS4wNTJjLTEuMDQ0LTQuNjggMS41NS0xMS40MzkgOC44MjYtMTEuOTY1bDM4LjQyNi0yLjU4NSA1Mi45NTggODEuMTEzdi03MS43NmwtMTMuNDk4LTEuNTUyYy0xLjA0My01LjczMyAzLjExMS05Ljg5NiA4LjMtMTAuNDA0bDM1Ljg0LTIuMDg3WiIvPjwvc3ZnPg==",
      alt: "Notion",
    },
  },

  // Row 1
  { row: 1, col: 0 }, // Empty
  {
    row: 1,
    col: 2,
    logo: {
      src: "data:image/svg+xml;base64,PHN2ZyBpZD0iY3Vyc29yX2xpZ2h0X19FYmVuZV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDQ2Ni43MyA1MzIuMDkiPjwhLS1HZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI5LjYuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDIuMS4xIEJ1aWxkIDkpLS0+PGRlZnM+PHN0eWxlPi5jdXJzb3JfbGlnaHRfX3N0MHtmaWxsOiMyNjI1MWV9PC9zdHlsZT48L2RlZnM+PHBhdGggY2xhc3M9ImN1cnNvcl9saWdodF9fc3QwIiBkPSJNNDU3LjQzLDEyNS45NEwyNDQuNDIsMi45NmMtNi44NC0zLjk1LTE1LjI4LTMuOTUtMjIuMTIsMEw5LjMsMTI1Ljk0Yy01Ljc1LDMuMzItOS4zLDkuNDYtOS4zLDE2LjExdjI0Ny45OWMwLDYuNjUsMy41NSwxMi43OSw5LjMsMTYuMTFsMjEzLjAxLDEyMi45OGM2Ljg0LDMuOTUsMTUuMjgsMy45NSwyMi4xMiwwbDIxMy4wMS0xMjIuOThjNS43NS0zLjMyLDkuMy05LjQ2LDkuMy0xNi4xMXYtMjQ3Ljk5YzAtNi42NS0zLjU1LTEyLjc5LTkuMy0xNi4xMWgtLjAxWk00NDQuMDUsMTUxLjk5bC0yMDUuNjMsMzU2LjE2Yy0xLjM5LDIuNC01LjA2LDEuNDItNS4wNi0xLjM2di0yMzMuMjFjMC00LjY2LTIuNDktOC45Ny02LjUzLTExLjMxTDI0Ljg3LDE0NS42N2MtMi40LTEuMzktMS40Mi01LjA2LDEuMzYtNS4wNmg0MTEuMjZjNS44NCwwLDkuNDksNi4zMyw2LjU3LDExLjM5aC0uMDFaIi8+PC9zdmc+",
      alt: "Cursor",
      isInvertable: true,
    },
  },
  {
    row: 1,
    col: 4,
    logo: {
      src: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjU2IDIyMiIgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQiPjxwYXRoIGZpbGw9IiMwMDAiIGQ9Im0xMjggMCAxMjggMjIxLjcwNUgweiIvPjwvc3ZnPg==",
      alt: "Vercel",
      isInvertable: true,
    },
  },

  // Row 2
  {
    row: 2,
    col: 1,
    logo: {
      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHBhdGggZD0iTTI1NiAxMjhhMTI4IDEyOCAwIDAxLTEyOCAxMjh6TTEyOCAwYzUyIDAgOTYuNyAzMSAxMTYuOCA3NS41TDc1LjUgMjQ0LjhjLTcuMy0zLjMtMTQuMi03LjItMjAuNy0xMS43TDE2MCAxMjhoLTMybC05MC41IDkwLjVBMTI4IDEyOCAwIDAxMTI4IDB6Ii8+PC9zdmc+",
      alt: "PlanetScale",
      isInvertable: true,
    },
  },
  {
    row: 2,
    col: 3,
    logo: {
      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgNDkuNCA1MTIgMzk5LjQyIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGwtcnVsZT0ibm9uemVybyI+PHBhdGggZmlsbD0iIzQyODVmNCIgZD0iTTM0LjkxIDQ0OC44MThoODEuNDU0VjI1MUwwIDE2My43MjdWNDEzLjkxYzAgMTkuMjg3IDE1LjYyMiAzNC45MSAzNC45MSAzNC45MXoiLz48cGF0aCBmaWxsPSIjMzRhODUzIiBkPSJNMzk1LjYzNiA0NDguODE4aDgxLjQ1NWMxOS4yODcgMCAzNC45MDktMTUuNjIyIDM0LjkwOS0zNC45MDlWMTYzLjcyN0wzOTUuNjM2IDI1MXoiLz48cGF0aCBmaWxsPSIjZmJiYzA0IiBkPSJNMzk1LjYzNiA5OS43MjdWMjUxTDUxMiAxNjMuNzI3di00Ni41NDVjMC00My4xNDItNDkuMjUtNjcuNzgyLTgzLjc4Mi00MS44OTF6Ii8+PC9nPjxwYXRoIGZpbGw9IiNlYTQzMzUiIGQ9Ik0xMTYuMzY0IDI1MVY5OS43MjdMMjU2IDIwNC40NTUgMzk1LjYzNiA5OS43MjdWMjUxTDI1NiAzNTUuNzI3eiIvPjxwYXRoIGZpbGw9IiNjNTIyMWYiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTAgMTE3LjE4MnY0Ni41NDVMMTE2LjM2NCAyNTFWOTkuNzI3TDgzLjc4MiA3NS4yOTFDNDkuMjUgNDkuNCAwIDc0LjA0IDAgMTE3LjE4eiIvPjwvZz48L3N2Zz4=",
      alt: "Gmail",
    },
  },

  // Row 3
  { row: 3, col: 0 }, // Empty
  {
    row: 3,
    col: 2,
    logo: {
      src: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTA5IDExMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNjMuNzA3NiAxMTAuMjg0QzYwLjg0ODEgMTEzLjg4NSA1NS4wNTAyIDExMS45MTIgNTQuOTgxMyAxMDcuMzE0TDUzLjk3MzggNDAuMDYyN0w5OS4xOTM1IDQwLjA2MjdDMTA3LjM4NCA0MC4wNjI3IDExMS45NTIgNDkuNTIyOCAxMDYuODU5IDU1LjkzNzRMNjMuNzA3NiAxMTAuMjg0WiIgZmlsbD0idXJsKCNzdXBhYmFzZV9fcGFpbnQwX2xpbmVhcikiLz48cGF0aCBkPSJNNjMuNzA3NiAxMTAuMjg0QzYwLjg0ODEgMTEzLjg4NSA1NS4wNTAyIDExMS45MTIgNTQuOTgxMyAxMDcuMzE0TDUzLjk3MzggNDAuMDYyN0w5OS4xOTM1IDQwLjA2MjdDMTA3LjM4NCA0MC4wNjI3IDExMS45NTIgNDkuNTIyOCAxMDYuODU5IDU1LjkzNzRMNjMuNzA3NiAxMTAuMjg0WiIgZmlsbD0idXJsKCNzdXBhYmFzZV9fcGFpbnQxX2xpbmVhcikiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PHBhdGggZD0iTTQ1LjMxNyAyLjA3MTAzQzQ4LjE3NjUgLTEuNTMwMzcgNTMuOTc0NSAwLjQ0MjkzNyA1NC4wNDM0IDUuMDQxTDU0LjQ4NDkgNzIuMjkyMkg5LjgzMTEzQzEuNjQwMzggNzIuMjkyMiAtMi45Mjc3NSA2Mi44MzIxIDIuMTY1NSA1Ni40MTc1TDQ1LjMxNyAyLjA3MTAzWiIgZmlsbD0iIzNFQ0Y4RSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0ic3VwYWJhc2VfX3BhaW50MF9saW5lYXIiIHgxPSI1My45NzM4IiB5MT0iNTQuOTc0IiB4Mj0iOTQuMTYzNSIgeTI9IjcxLjgyOTUiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjMjQ5MzYxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjM0VDRjhFIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9InN1cGFiYXNlX19wYWludDFfbGluZWFyIiB4MT0iMzYuMTU1OCIgeTE9IjMwLjU3OCIgeDI9IjU0LjQ4NDQiIHkyPSI2NS4wODA2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3AvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+",
      alt: "Supabase",
    },
  },
  {
    row: 3,
    col: 4,
    logo: {
      src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXBhdGg9InVybCgjY2FudmFfX2NsaXAwXzkwNV8xNzkwKSI+PHBhdGggZD0iTTQwIDgwQzYyLjA5MTQgODAgODAgNjIuMDkxNCA4MCA0MEM4MCAxNy45MDg2IDYyLjA5MTQgMCA0MCAwQzE3LjkwODYgMCAwIDE3LjkwODYgMCA0MEMwIDYyLjA5MTQgMTcuOTA4NiA4MCA0MCA4MFoiIGZpbGw9IiM3RDJBRTciLz48cGF0aCBkPSJNNDAgODBDNjIuMDkxNCA4MCA4MCA2Mi4wOTE0IDgwIDQwQzgwIDE3LjkwODYgNjIuMDkxNCAwIDQwIDBDMTcuOTA4NiAwIDAgMTcuOTA4NiAwIDQwQzAgNjIuMDkxNCAxNy45MDg2IDgwIDQwIDgwWiIgZmlsbD0idXJsKCNjYW52YV9fcGFpbnQwX3JhZGlhbF85MDVfMTc5MCkiLz48cGF0aCBkPSJNNDAgODBDNjIuMDkxNCA4MCA4MCA2Mi4wOTE0IDgwIDQwQzgwIDE3LjkwODYgNjIuMDkxNCAwIDQwIDBDMTcuOTA4NiAwIDAgMTcuOTA4NiAwIDQwQzAgNjIuMDkxNCAxNy45MDg2IDgwIDQwIDgwWiIgZmlsbD0idXJsKCNjYW52YV9fcGFpbnQxX3JhZGlhbF85MDVfMTc5MCkiLz48cGF0aCBkPSJNNDAgODBDNjIuMDkxNCA4MCA4MCA2Mi4wOTE0IDgwIDQwQzgwIDE3LjkwODYgNjIuMDkxNCAwIDQwIDBDMTcuOTA4NiAwIDAgMTcuOTA4NiAwIDQwQzAgNjIuMDkxNCAxNy45MDg2IDgwIDQwIDgwWiIgZmlsbD0idXJsKCNjYW52YV9fcGFpbnQyX3JhZGlhbF85MDVfMTc5MCkiLz48cGF0aCBkPSJNNDAgODBDNjIuMDkxNCA4MCA4MCA2Mi4wOTE0IDgwIDQwQzgwIDE3LjkwODYgNjIuMDkxNCAwIDQwIDBDMTcuOTA4NiAwIDAgMTcuOTA4NiAwIDQwQzAgNjIuMDkxNCAxNy45MDg2IDgwIDQwIDgwWiIgZmlsbD0idXJsKCNjYW52YV9fcGFpbnQzX3JhZGlhbF85MDVfMTc5MCkiLz48cGF0aCBkPSJNNTcuMjY5MSA0OC4yMDUyQzU2LjkzOSA0OC4yMDUyIDU2LjY0ODUgNDguNDg0IDU2LjM0NjIgNDkuMDkyOEM1Mi45MzIzIDU2LjAxNTMgNDcuMDM1OCA2MC45MTM0IDQwLjIxMjUgNjAuOTEzNEMzMi4zMjI4IDYwLjkxMzQgMjcuNDM3IDUzLjc5MTMgMjcuNDM3IDQzLjk1MjJDMjcuNDM3IDI3LjI4NTUgMzYuNzIzMiAxNy42NDkxIDQ0Ljg3OTYgMTcuNjQ5MUM0OC42OTEgMTcuNjQ5MSA1MS4wMTg2IDIwLjA0NDMgNTEuMDE4NiAyMy44NTU5QzUxLjAxODYgMjguMzc5NiA0OC40NDg1IDMwLjc3NDggNDguNDQ4NSAzMi4zNzAyQzQ4LjQ0ODUgMzMuMDg2NCA0OC44OTM5IDMzLjUyMDEgNDkuNzc3MyAzMy41MjAxQzUzLjMyNjQgMzMuNTIwMSA1Ny40OTE4IDI5LjQ0MTkgNTcuNDkxOCAyMy42ODA4QzU3LjQ5MTggMTguMDk0NyA1Mi42MyAxMy45ODg4IDQ0LjQ3MzcgMTMuOTg4OEMzMC45OTQgMTMuOTg4OCAxOS4wMTQyIDI2LjQ4NTggMTkuMDE0MiA0My43NzdDMTkuMDE0MiA1Ny4xNjE0IDI2LjY1NzIgNjYuMDA2MSAzOC40NSA2Ni4wMDYxQzUwLjk2NjggNjYuMDA2MSA1OC4yMDQzIDUzLjU1MjYgNTguMjA0MyA0OS41MTA1QzU4LjIwNDMgNDguNjE1MyA1Ny43NDY2IDQ4LjIwNTIgNTcuMjY5MSA0OC4yMDUyWiIgZmlsbD0id2hpdGUiLz48L2c+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJjYW52YV9fcGFpbnQwX3JhZGlhbF85MDVfMTc5MCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgxNS40NTMgNzAuOTA1Nykgcm90YXRlKC00OS40MTYpIHNjYWxlKDYxLjg3MzMpIj48c3RvcCBzdG9wLWNvbG9yPSIjNjQyMEZGIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNjQyMEZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjxyYWRpYWxHcmFkaWVudCBpZD0iY2FudmFfX3BhaW50MV9yYWRpYWxfOTA1XzE3OTAiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjEuMTc4OCA5LjA5NDU3KSByb3RhdGUoNTQuNzAzKSBzY2FsZSg2OS43NzM1KSI+PHN0b3Agc3RvcC1jb2xvcj0iIzAwQzRDQyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwQzRDQyIgc3RvcC1vcGFjaXR5PSIwIi8+PC9yYWRpYWxHcmFkaWVudD48cmFkaWFsR3JhZGllbnQgaWQ9ImNhbnZhX19wYWludDJfcmFkaWFsXzkwNV8xNzkwIiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDE1LjQ1MjYgNzAuOTA1Mykgcm90YXRlKC00NS4xOTU0KSBzY2FsZSg2MS4xMjQyIDI4LjExMTgpIj48c3RvcCBzdG9wLWNvbG9yPSIjNjQyMEZGIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNjQyMEZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjxyYWRpYWxHcmFkaWVudCBpZD0iY2FudmFfX3BhaW50M19yYWRpYWxfOTA1XzE3OTAiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzIuNzE1OCAxMC43Nzg5KSByb3RhdGUoNjYuNTE5OCkgc2NhbGUoNjIuOTgzNiAxMDUuNTEyKSI+PHN0b3Agc3RvcC1jb2xvcj0iIzAwQzRDQyIgc3RvcC1vcGFjaXR5PSIwLjcyNTkxNiIvPjxzdG9wIG9mZnNldD0iMC4wMDAxIiBzdG9wLWNvbG9yPSIjMDBDNENDIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDBDNENDIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjxjbGlwUGF0aCBpZD0iY2FudmFfX2NsaXAwXzkwNV8xNzkwIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IndoaXRlIi8+PC9jbGlwUGF0aD48L2RlZnM+PC9zdmc+",
      alt: "Canva",
    },
  },

  // Row 4
  {
    row: 4,
    col: 1,
    logo: {
      src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTEiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA5MSA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXBhdGg9InVybCgjYWRvYmVfX2NsaXAwXzkwNl8xODM5KSI+PHBhdGggZD0iTTU2Ljk2ODYgMEg5MC40MzE4VjgwTDU2Ljk2ODYgMFoiIGZpbGw9IiNFQjEwMDAiLz48cGF0aCBkPSJNMzMuNDYzMiAwSDBWODBMMzMuNDYzMiAwWiIgZmlsbD0iI0VCMTAwMCIvPjxwYXRoIGQ9Ik00NS4xODIxIDI5LjQ2NjhMNjYuNTE5OSA4MC4wMDAySDUyLjU2NTdMNDYuMTk4MiA2My45NDYxSDMwLjYxODJMNDUuMTgyMSAyOS40NjY4WiIgZmlsbD0iI0VCMTAwMCIvPjwvZz48ZGVmcz48Y2xpcFBhdGggaWQ9ImFkb2JlX19jbGlwMF85MDZfMTgzOSI+PHJlY3Qgd2lkdGg9IjkwLjQzMTgiIGhlaWdodD0iODAiIGZpbGw9IndoaXRlIi8+PC9jbGlwUGF0aD48L2RlZnM+PC9zdmc+",
      alt: "Adobe",
    },
  },
  {
    row: 4,
    col: 3,
    logo: {
      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PGcgY2xpcC1wYXRoPSJ1cmwoI3BvbGFyX3NoX2xpZ2h0X19hKSI+PHBhdGggZmlsbD0iIzAwNjJGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNjYuNDI4IDI3NC4yNmM2OC40NDggNDYuMzMzIDE2MS40OTcgMjguNDA2IDIwNy44My00MC4wNDEgNDYuMzM1LTY4LjQ0OCAyOC40MDgtMTYxLjQ5Ny00MC4wNC0yMDcuODNDMTY1Ljc3LTE5Ljk0NiA3Mi43MjEtMi4wMTkgMjYuMzg4IDY2LjQyOC0xOS45NDggMTM0Ljg3OC0yLjAyIDIyNy45MjggNjYuNDI3IDI3NC4yNlpNNDcuOTU2IDExNi42N2MtMTcuMTE5IDUyLjU5My0xMS40MTIgMTA1LjIyMyAxMS4yOSAxMzkuNzAzQzE4LjA0IDIxNy4zNjEgNy4yNzUgMTUwLjMwNyAzNi45NDMgOTIuMzE4YzE4Ljk3MS0zNy4wODIgNTAuNjIzLTYyLjkyNCA4NS41NTYtNzMuOTctMzEuOTA5IDE4LjM2My01OS45NDUgNTMuNDY2LTc0LjU0NCA5OC4zMjJabTEyNy4zOTEgMTY2LjQ2N2MzNi4wMy0xMC41MzEgNjguODY0LTM2Ljc1MiA4OC4zMzgtNzQuODE1IDI5LjQxNi01Ny40OTcgMTkuMDgzLTEyMy45MDUtMjEuMjU4LTE2My4wNTUgMjEuNzkzIDM0LjQ5NiAyNy4wNDYgODYuMjc1IDEwLjIwNCAxMzguMDItMTUuMDE2IDQ2LjEzNC00NC4yNDYgODEuOTUyLTc3LjI4NCA5OS44NVptOC4yOC0xNi45MDhjMjQuMzE4LTIwLjgxMSA0NC4zODktNTUuNjI1IDUzLjMwOS05Ny40MzkgMTQuMDk3LTY2LjA5Ny00LjM4NS0xMjcuNTkyLTQxLjgyNC0xNDguMTEzIDE5Ljg1OCAyNi43MTggMjkuOTEgNzguNjEzIDIzLjcxMiAxMzYuNjU2LTQuNzM5IDQ0LjM5MS0xOC4wMSA4My4yNi0zNS4xOTcgMTA4Ljg5NlpNNjMuNzE3IDEzMS44NDRjLTE0LjIwMSA2Ni41ODYgNC42NiAxMjguNTAxIDQyLjY1NyAxNDguNTYxLTIwLjM3OC0yNi4zOTYtMzAuNzc3LTc4Ljg5MS0yNC40OTgtMTM3LjY5NCA0LjY2MS00My42NTcgMTcuNTc0LTgxLjk3NCAzNC4zNDktMTA3LjYxNC0yMy45NTcgMjAuODg2LTQzLjY4NyA1NS4zOTItNTIuNTA3IDk2Ljc0N1ptMTM2LjExNyAxNy43MTdjMS4wNzQgNjcuOTEyLTIwLjI0NCAxMjMuMzE3LTQ3LjYxMiAxMjMuNzQ4LTI3LjM2OS40MzMtNTAuNDI1LTU0LjI3LTUxLjQ5OC0xMjIuMTgyLTEuMDczLTY3LjkxMyAyMC4yNDQtMTIzLjMxOCA0Ny42MTMtMTIzLjc1IDI3LjM2OC0uNDMyIDUwLjQyNSA1NC4yNzEgNTEuNDk3IDEyMi4xODRaIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L2c+PGRlZnM+PGNsaXBQYXRoIGlkPSJwb2xhcl9zaF9saWdodF9fYSI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgzMDB2MzAwSDB6Ii8+PC9jbGlwUGF0aD48L2RlZnM+PC9zdmc+",
      alt: "Polar",
    },
  },
];

export default IntegrationsVisual;
