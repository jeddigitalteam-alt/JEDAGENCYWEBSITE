"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { INDUSTRIES } from "@/lib/industries";
import { WORK, hasCaseStudy, type CaseStudy } from "@/lib/work";
import { Eyebrow } from "@/components/ui/primitives";

/**
 * A grid card. Only a button where the study has a case-study page to open —
 * otherwise an inert div, so it carries no pointer affordance and takes no
 * focus, while looking exactly the same.
 */
function GridCard({
  study,
  onOpen,
  children,
}: {
  study: CaseStudy;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  if (!hasCaseStudy(study))
    return <div className="w-full text-left">{children}</div>;
  return (
    <button onClick={onOpen} data-cursor="View" className="group w-full text-left">
      {children}
    </button>
  );
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Filterable case grid with layout reordering, plus a shared-element morph:
 * the clicked tile's image expands into the hero before the route changes.
 *
 * The morph runs on this page and then navigates, rather than attempting to
 * hand a layoutId across an App Router route boundary — the tree unmounts on
 * navigation, so a cross-route layoutId silently degrades to a crossfade. This
 * way the morph is real and the timing is under our control.
 */
export function CaseGrid() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<string | null>(null);
  const [morphing, setMorphing] = useState<CaseStudy | null>(null);

  const shown = useMemo(
    () => (filter ? WORK.filter((w) => w.industries.includes(filter)) : WORK),
    [filter],
  );

  const open = (study: CaseStudy) => {
    if (reduced) {
      router.push(`/work/${study.slug}`);
      return;
    }
    setMorphing(study);
    // Let the morph play before the route swaps underneath it.
    setTimeout(() => router.push(`/work/${study.slug}`), 520);
  };

  return (
    <section className="px-5 py-20 md:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <Eyebrow className="mr-2">Filter</Eyebrow>
        <button
          onClick={() => setFilter(null)}
          aria-pressed={filter === null}
          className={`mono rounded-full border px-4 py-2 transition-colors ${
            filter === null
              ? "border-blue text-blue"
              : "border-rule text-content-dim hover:border-blue hover:text-blue"
          }`}
        >
          All — {WORK.length}
        </button>
        {INDUSTRIES.map((ind) => {
          const count = WORK.filter((w) =>
            w.industries.includes(ind.slug),
          ).length;
          if (!count) return null;
          const on = filter === ind.slug;
          return (
            <button
              key={ind.slug}
              onClick={() => setFilter(on ? null : ind.slug)}
              aria-pressed={on}
              className={`mono rounded-full border px-4 py-2 transition-colors ${
                on
                  ? "border-blue text-blue"
                  : "border-rule text-content-dim hover:border-blue hover:text-blue"
              }`}
            >
              {ind.name} — {count}
            </button>
          );
        })}
      </div>

      <motion.ul
        layout={!reduced}
        /* Stable hook for verify-interactions: the cards are no longer all
           buttons, so the filter test counts list items here rather than
           clickable elements. No visual effect. */
        data-case-grid=""
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((study) => (
            <motion.li
              key={study.slug}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* A button only where there is a page to open. Studies without
                  one render as a plain div: not focusable, no pointer
                  affordance, visually identical. See hasCaseStudy. */}
              <GridCard study={study} onOpen={() => open(study)}>
                <motion.div
                  layoutId={reduced ? undefined : `case-${study.slug}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-raised"
                >
                  <Image
                    src={study.thumb}
                    alt={`${study.client} — ${study.summary}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </motion.div>
                <h3 className="display mt-4 text-step-1 transition-colors group-hover:text-blue">
                  {study.client}
                </h3>
                <p className="mono mt-1 text-content-dim">
                  {study.sector} — {study.year}
                </p>
              </GridCard>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {!shown.length ? (
        <div className="mt-16 rounded-xl border border-dashed border-rule p-10 text-center">
          <p className="text-step-0 text-content-dim">
            No projects tagged with that yet.
          </p>
          <button
            onClick={() => setFilter(null)}
            className="mono mt-4 text-blue underline underline-offset-4"
          >
            Show all {WORK.length} projects
          </button>
        </div>
      ) : null}

      {/* the morph target */}
      <AnimatePresence>
        {morphing ? (
          <motion.div
            className="fixed inset-0 z-[85] bg-ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              layoutId={`case-${morphing.slug}`}
              className="relative h-full w-full overflow-hidden"
              transition={{ duration: 0.52, ease: EASE }}
            >
              <Image
                src={morphing.hero}
                alt=""
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export default CaseGrid;
