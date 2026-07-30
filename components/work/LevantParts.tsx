"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Chapter, Swatch } from "@/lib/work";

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

/* ------------------------------------------------------- device mockup */

/**
 * iMac frame whose contents scroll as the page scrolls.
 *
 * The inner image is taller than the screen aperture; scroll progress across
 * the section maps to its Y offset, so the PDP appears to be scrolled inside
 * the device. Under reduced motion the image simply sits at the top.
 */
export function DeviceMockup({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // -68% leaves the last screenful visible rather than scrolling past the end.
  const y = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "-68%"]);

  return (
    <figure ref={ref} className="mt-12">
      <div className="mx-auto max-w-4xl">
        {/* bezel */}
        <div className="rounded-2xl border border-rule bg-ink-raised p-3 md:p-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-ink">
            <motion.div
              className="absolute inset-x-0 top-0"
              style={reduced ? undefined : { y }}
            >
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={3000}
                sizes="(min-width: 768px) 56rem, 100vw"
                className="w-full"
              />
            </motion.div>
          </div>
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
      <figcaption className="mono mt-6 text-center text-content-dim">
        {caption}
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
