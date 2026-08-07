"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SERVICES, estimateScope } from "@/lib/services";
import { Eyebrow } from "@/components/ui/primitives";
import RevealHeading from "@/components/motion/RevealHeading";

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.7 } as const;

/**
 * The services the board can build a scope from.
 *
 * Retainer is deliberately excluded: it is a standing arrangement rather than a
 * scoped piece of work, so it has no meaningful phase estimate to add to the
 * board. Every count on this component derives from this list, so the shelf,
 * the "picked / total" counter and the estimate all stay in agreement.
 */
const SCOPE_SERVICES = SERVICES.filter((s) => s.slug !== "retainer");

/**
 * "Build your scope."
 *
 * Service tiles snap into a board as pieces. `layoutId` does the physical part:
 * the same element animates from the shelf into its slot, so it reads as one
 * object moving rather than two crossfading. The estimate updates live and the
 * same numbers are handed to the contact form via query params, so the scope
 * the user built is the scope that arrives in the inbox.
 *
 * `atTop` is the only thing that varies: it is the opening section of the
 * services page now, so it takes the page's top padding to clear the fixed
 * header and its heading becomes the page's h1. Nothing about the board — the
 * options, the estimate, the layout animation or the hand-off to the contact
 * form — depends on it.
 */
export function ScopeBuilder({ atTop = false }: { atTop?: boolean }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<string[]>([]);

  const estimate = useMemo(() => estimateScope(picked), [picked]);
  const available = SCOPE_SERVICES.filter((s) => !picked.includes(s.slug));

  const toggle = (slug: string) =>
    setPicked((p) =>
      p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug],
    );

  const send = () => {
    const params = new URLSearchParams({
      scope: picked.join(","),
      weeks: String(estimate.weeks),
    });
    router.push(`/contact?${params.toString()}`);
  };

  return (
    <section
      className={
        atTop
          ? "px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-40"
          : "px-5 py-24 md:px-8 md:py-32"
      }
    >
      <Eyebrow>Build your scope</Eyebrow>
      <RevealHeading
        as={atTop ? "h1" : "h2"}
        className="display mt-4 max-w-[20ch] text-step-4"
        roman="Pick the pieces. We’ll"
        italic="tell you the shape"
      />
      <p className="mt-6 max-w-[54ch] text-step-0 text-content-dim">
        Select the work you think you need. The board fills in as you go and the
        estimate updates — phases from different services overlap, so the total
        is shorter than adding them up.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* shelf */}
        <div>
          <p className="mono mb-4 text-content-dim">
            Available — {available.length}
          </p>
          <ul className="flex flex-wrap gap-3">
            <AnimatePresence mode="popLayout">
              {available.map((s) => (
                <motion.li
                  key={s.slug}
                  layoutId={reduced ? undefined : `piece-${s.slug}`}
                  layout={!reduced}
                  transition={reduced ? { duration: 0 } : SPRING}
                  exit={reduced ? { opacity: 0 } : undefined}
                >
                  <button
                    onClick={() => toggle(s.slug)}
                    className="mono rounded-full border border-rule px-5 py-3 text-left transition-colors hover:border-blue hover:text-blue"
                    aria-pressed={false}
                  >
                    + {s.name}
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {!available.length ? (
            <p className="text-step--1 text-content-dim">
              Everything’s on the board. Remove a piece to put it back.
            </p>
          ) : null}
        </div>

        {/* board */}
        <div className="rounded-2xl border border-rule bg-ink-raised p-5 md:p-6">
          <div className="flex items-baseline justify-between">
            <p className="mono text-content-dim">Your scope</p>
            <p className="mono tabular-nums text-content-dim">
              {String(picked.length).padStart(2, "0")} /{" "}
              {String(SCOPE_SERVICES.length).padStart(2, "0")}
            </p>
          </div>

          <ul className="mt-5 grid min-h-[13rem] content-start gap-2">
            <AnimatePresence mode="popLayout">
              {picked.map((slug, i) => {
                const s = SCOPE_SERVICES.find((x) => x.slug === slug)!;
                return (
                  <motion.li
                    key={slug}
                    layoutId={reduced ? undefined : `piece-${slug}`}
                    layout={!reduced}
                    transition={reduced ? { duration: 0 } : SPRING}
                    className="relative"
                  >
                    <button
                      onClick={() => toggle(slug)}
                      className="group flex w-full items-center justify-between gap-4 rounded-lg border border-blue/40 bg-surface px-4 py-3 text-left transition-colors hover:border-coral"
                      aria-pressed
                    >
                      <span className="flex items-center gap-3">
                        <span className="mono text-blue">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-step--1">{s.name}</span>
                      </span>
                      <span className="mono text-content-dim transition-colors group-hover:text-coral">
                        Remove
                      </span>
                    </button>
                    {/* the notch that seats this piece against the next */}
                    {i < picked.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1 left-8 h-2 w-4 rounded-b-full border-x border-b border-blue/40 bg-surface"
                      />
                    ) : null}
                  </motion.li>
                );
              })}
            </AnimatePresence>

            {!picked.length ? (
              <li className="grid min-h-[13rem] place-items-center rounded-lg border border-dashed border-rule">
                <p className="mono text-content-dim">
                  Add a service to start the board
                </p>
              </li>
            ) : null}
          </ul>

          {/* live estimate */}
          <div className="mt-6 border-t border-rule pt-5">
            <div className="flex items-baseline justify-between">
              <p className="mono text-content-dim">Indicative timeline</p>
              <motion.p
                key={estimate.weeks}
                initial={reduced ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="display text-step-2 tabular-nums"
              >
                {estimate.weeks ? `${estimate.weeks} weeks` : "—"}
              </motion.p>
            </div>

            <ul className="mt-4 grid gap-1.5">
              <AnimatePresence initial={false}>
                {estimate.phases.map((p) => (
                  <motion.li
                    key={p.name}
                    initial={reduced ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.24, ease: EASE }}
                    className="flex items-center justify-between overflow-hidden"
                  >
                    <span className="mono text-content-dim">{p.name}</span>
                    <span className="mono tabular-nums">{p.weeks}w</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <button
              onClick={send}
              disabled={!picked.length}
              className="mono mt-6 w-full rounded-full bg-blue px-6 py-3.5 text-ink transition-colors enabled:hover:bg-blue-lift enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink-raised disabled:text-content-dim"
            >
              {picked.length
                ? `Send this scope — ${estimate.weeks} weeks`
                : "Add a service first"}
            </button>
            <p className="mono mt-3 text-content-dim">
              Takes you to the contact form with this scope filled in. Nothing
              is sent yet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScopeBuilder;
