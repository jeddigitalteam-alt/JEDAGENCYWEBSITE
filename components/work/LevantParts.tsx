"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Chapter, DeviceScreen, Swatch } from "@/lib/work";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------- chapter nav */

/**
 * Sticky chapter nav. Uses IntersectionObserver rather than scroll maths so it
 * stays correct while Lenis is driving the scroll position.
 */
export function ChapterNav({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id);

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => !!el);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.5, 1] },
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [chapters]);

  return (
    <nav
      aria-label="Case study chapters"
      className="sticky top-28 hidden self-start lg:block"
    >
      <ol className="grid gap-3">
        {chapters.map((c, i) => {
          const isActive = active === c.id;
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`mono flex items-center gap-3 transition-colors ${
                  isActive ? "text-blue" : "text-content-dim hover:text-content"
                }`}
              >
                <span
                  className={`h-px transition-all duration-300 ${
                    isActive ? "w-8 bg-blue" : "w-4 bg-rule"
                  }`}
                  aria-hidden="true"
                />
                {String(i + 1).padStart(2, "0")} {c.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------------------------------------------------- device showcase */

/**
 * iMac frame showing real screens from the build, one at a time.
 *
 * The frame is deliberately inert: bezel, stand and the 16:10 aperture never
 * move, and only the screen inside changes. Screens crossfade rather than
 * slide, so nothing appears to leave the device.
 *
 * Driven by explicit controls rather than scroll position. Each screen is a
 * separate capture at its own aspect ratio, so there is nothing continuous to
 * map scroll onto, and an arrow the reader can press behaves identically on a
 * phone — where scroll-linked timing is the least predictable.
 *
 * Captures are cropped to the aperture with `object-cover` and a per-screen
 * `objectPosition`; they are never scaled to fit, so none of them distorts.
 */
export function DeviceShowcase({
  screens,
  caption,
}: {
  screens: DeviceScreen[];
  caption: string;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const count = screens.length;

  const go = useCallback(
    (step: number) => setIndex((i) => (i + step + count) % count),
    [count],
  );

  const current = screens[index];

  return (
    <figure className="mt-12">
      <div className="mx-auto max-w-4xl">
        {/* bezel — fixed */}
        <div className="rounded-2xl border border-rule bg-ink-raised p-3 md:p-4">
          <motion.div
            className="relative aspect-[16/10] cursor-grab overflow-hidden rounded-lg bg-ink active:cursor-grabbing"
            /* Swipe on touch. `pan-y` keeps vertical page scrolling with the
               finger; the lock stops a scroll gesture registering as a swipe. */
            style={{ touchAction: "pan-y" }}
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.06}
            dragDirectionLock
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.x < -48) go(1);
              else if (info.offset.x > 48) go(-1);
            }}
            role="group"
            aria-roledescription="carousel"
            aria-label={`${current.label} — screen ${index + 1} of ${count}`}
          >
            {screens.map((s, i) => (
              <motion.div
                key={s.src}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === index ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
                aria-hidden={i !== index}
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 768px) 56rem, 100vw"
                  className="object-cover"
                  style={s.position ? { objectPosition: s.position } : undefined}
                  priority={i === 0}
                  draggable={false}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
        {/* stand */}
        <div
          className="mx-auto h-6 w-28 rounded-b-xl border-x border-b border-rule bg-ink-raised"
          aria-hidden="true"
        />
        <div
          className="mx-auto h-1.5 w-48 rounded-full bg-ink-raised"
          aria-hidden="true"
        />
      </div>

      <figcaption className="mt-6">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous screen"
            className="mono rounded-full border border-rule px-4 py-2 transition-colors hover:border-blue hover:text-blue"
          >
            ←
          </button>
          <span className="mono text-content-dim" aria-hidden="true">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}{" "}
            — {current.label}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next screen"
            className="mono rounded-full border border-rule px-4 py-2 transition-colors hover:border-blue hover:text-blue"
          >
            →
          </button>
        </div>
        <p className="mono mt-3 text-center text-content-dim">{caption}</p>
        <span className="sr-only" role="status" aria-live="polite">
          {current.label} — screen {index + 1} of {count}
        </span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------ palette reveal */

export function PaletteReveal({ swatches }: { swatches: Swatch[] }) {
  return (
    <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
      {swatches.map((s, i) => (
        <motion.li
          key={s.name}
          className="bg-surface p-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
        >
          <motion.div
            className="h-24 w-full rounded-lg"
            style={{ backgroundColor: s.value }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.08 + 0.1, ease: EASE }}
          />
          <p className="mono mt-4">{s.name}</p>
          <p className="mono mt-1 text-content-dim">{s.note}</p>
        </motion.li>
      ))}
    </ul>
  );
}
