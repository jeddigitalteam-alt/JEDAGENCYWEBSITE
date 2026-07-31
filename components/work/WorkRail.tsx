"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { WORK } from "@/lib/work";

/**
 * Horizontal work rail with drag inertia, keyboard support and a mono index.
 *
 * Drag constraints are measured after layout and re-measured on resize —
 * hardcoding them breaks the moment the viewport or font metrics change.
 * Keyboard users get arrow-key stepping with the same snap positions, so the
 * rail is fully operable without a pointer.
 */
export function WorkRail() {
  const reduced = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [maxDrag, setMaxDrag] = useState(0);
  const [active, setActive] = useState(0);

  const measure = useCallback(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;
    setMaxDrag(Math.max(0, track.scrollWidth - vp.clientWidth));
  }, []);

  useLayoutEffect(() => {
    // ResizeObserver fires once on observe, which covers the initial
    // measurement — no synchronous measure() call needed here.
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(i, WORK.length - 1));
    setActive(clamped);
    const track = trackRef.current;
    const card = track?.children[clamped] as HTMLElement | undefined;
    card?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!viewportRef.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(active + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(active - 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  return (
    <div>
      <div
        ref={viewportRef}
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <motion.ul
          ref={trackRef}
          className="flex w-max gap-6 px-5 pb-4 md:px-8"
          drag={reduced ? false : "x"}
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.06}
          dragMomentum
        >
          {WORK.map((study, i) => (
            <li
              key={study.slug}
              className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-[32vw]"
            >
              <Link
                href={`/work/${study.slug}`}
                data-cursor="View"
                className="group block"
                onFocus={() => setActive(i)}
                // Native drag would fight the rail's own drag gesture.
                draggable={false}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-raised">
                  <Image
                    src={study.thumb}
                    alt={`${study.client} — ${study.summary}`}
                    fill
                    sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 78vw"
                    loading={i < 3 ? undefined : "lazy"}
                    priority={i < 2}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    draggable={false}
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="display text-step-1 transition-colors group-hover:text-blue">
                    {study.client}
                  </h2>
                  <span className="mono shrink-0 text-content-dim">
                    {study.year}
                  </span>
                </div>
                <p className="mono mt-1 text-content-dim">{study.sector}</p>
              </Link>
            </li>
          ))}
        </motion.ul>
      </div>

      <div className="mt-6 flex items-center gap-4 px-5 md:px-8">
        <span className="mono tabular-nums text-content-dim">
          {String(active + 1).padStart(2, "0")} / {WORK.length}
        </span>
        <div className="h-px flex-1 bg-rule">
          <motion.div
            className="h-px bg-blue"
            animate={{ width: `${((active + 1) / WORK.length) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
}

export default WorkRail;
