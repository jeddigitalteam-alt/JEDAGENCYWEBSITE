"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useScrollAssembly,
  type AssemblyPlan,
} from "@/components/home/use-scroll-assembly";
import { Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { PROCESS, type ProcessStage } from "@/lib/process";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The four stages, arriving alternately from the left and the right.
 *
 * The flight plan is the same utility the articles section uses —
 * `useScrollAssembly` — for the same reason: it is scrubbed by scroll but runs
 * strictly one way. Progress is a high-water mark, so scrolling back up never
 * rewinds a row, and once every row is home the loop latches and disconnects.
 *
 * Two deliberate differences from the articles plan:
 *
 * **No `collapse`.** That field is what buys the articles section its extra
 * scroll height and its sticky stage. Omitting it means there is no runway and
 * nothing pins — each row simply animates as it arrives and the page scrolls
 * straight through at its natural height. No jolt at the end, because there is
 * no height to give back.
 *
 * **`narrowAt` set past any real viewport**, which puts every row on `ownPace`
 * at every width. The hook offers own-pace timing for stacked layouts, and that
 * is exactly the shape here: four full-width rows several hundred pixels apart,
 * so one shared progress would assemble the bottom two while they were still
 * below the fold. Each row takes its progress from its own slot instead. There
 * are no `narrow` overrides because there is nothing to override — the travel
 * is stated in `vw`, so it already scales with the screen.
 *
 * The travel is large on purpose: half a viewport, with a few degrees of rake
 * and a slight undersize, resolving to exactly nothing. The section clips, so
 * a row still 50vw out cannot widen the page.
 */
const ASSEMBLY: AssemblyPlan = {
  narrowAt: 100000,
  flights: [
    {
      select: "[data-flight=stage-0]",
      x: -54,
      rotate: -5,
      scale: 0.95,
      opacity: 0.18,
      lift: true,
      ownPace: true,
    },
    {
      select: "[data-flight=stage-1]",
      x: 54,
      rotate: 5,
      scale: 0.95,
      opacity: 0.18,
      lift: true,
      ownPace: true,
    },
    {
      select: "[data-flight=stage-2]",
      x: -48,
      rotate: -4,
      scale: 0.96,
      opacity: 0.22,
      lift: true,
      ownPace: true,
    },
    {
      select: "[data-flight=stage-3]",
      x: 48,
      rotate: 4,
      scale: 0.96,
      opacity: 0.22,
      lift: true,
      ownPace: true,
    },
  ],
};

/* ------------------------------------------------------------------ panel */

/**
 * The stage panel.
 *
 * Follows the command palette's dialog idiom — fixed overlay that closes on a
 * click, panel that stops the click, `role="dialog"` with `aria-modal` — and
 * adds a focus trap, which the palette does not need because its own input is
 * the only thing in it.
 *
 * Focus handling, in full:
 *
 * - opening moves focus into the panel, onto the close control;
 * - Tab and Shift+Tab cycle within the panel and cannot reach the page behind;
 * - Escape closes;
 * - closing returns focus to the row that opened it, which is what makes the
 *   panel usable from the keyboard at all — otherwise focus would fall back to
 *   the top of the document.
 *
 * A bottom sheet below `sm` and a centred panel above it, which is the same
 * component with different placement classes rather than two implementations.
 */
function StagePanel({
  stage,
  onClose,
}: {
  stage: ProcessStage;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    // A frame, so the panel is mounted and measurable before focus moves.
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Wrap at both ends, and pull focus back in if it has escaped entirely.
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/75 px-0 sm:items-center sm:px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stage-panel-title"
    >
      <motion.div
        ref={panelRef}
        /* Bottom sheet on a phone, centred panel from `sm`. The max-height and
           inner scroll are what keep the longer stages reachable on a short
           screen without the panel growing past the viewport. */
        className="max-h-[88svh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-rule bg-ink-raised p-6 sm:max-h-[86svh] sm:rounded-2xl sm:p-9"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.28, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mono text-blue">
          {stage.n} / {stage.label.toUpperCase()}
        </p>

        <h3
          id="stage-panel-title"
          className="display mt-4 text-step-3"
        >
          {stage.title}
        </h3>

        <p className="mt-5 max-w-[56ch] text-step-0 text-content-dim">
          {stage.intro}
        </p>

        <div className="mt-8 border-t border-rule pt-6">
          <p className="mono text-content-dim">What happens</p>
          <p className="mt-3 max-w-[56ch] text-step--1 text-content-dim">
            {stage.happens}
          </p>
        </div>

        <div className="mt-6 border-t border-rule pt-6">
          <p className="mono text-content-dim">What you get</p>
          <p className="mt-3 max-w-[56ch] text-step--1 text-content-dim">
            {stage.gives}
          </p>
        </div>

        <button
          ref={closeRef}
          onClick={onClose}
          className="mono mt-8 inline-flex items-center gap-2 rounded-full border border-rule px-5 py-2.5 transition-colors hover:border-blue hover:text-blue"
        >
          <span aria-hidden="true">×</span> Close
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- section */

export function ProcessLadder() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  /* The row that opened the panel, so focus can go back to it on close. */
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useScrollAssembly(zoneRef, ASSEMBLY, !reduced);

  const close = useCallback(() => {
    setOpen(null);
    // After the exit animation has begun; the element is still in the document.
    requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  return (
    /* `overflow-clip` rather than `hidden`: it stops a row that is still half a
       viewport out from widening the page, without creating a scroll container
       that focus could scroll inside. */
    <section
      ref={zoneRef}
      className="overflow-clip px-5 py-24 md:px-8 md:py-32"
    >
      <Eyebrow>Our process</Eyebrow>
      <SectionHeading
        roman="How good work"
        italic="comes together"
        className="mt-4 max-w-[18ch]"
      />

      <ul className="mt-14 border-t border-rule md:mt-20">
        {PROCESS.map((stage, i) => (
          /* The <li> is the stationary slot the hook reads progress from — it
             must not move, so every transform goes on the div inside it. */
          <li key={stage.n} className="border-b border-rule">
            <div data-flight={`stage-${i}`}>
              <button
                type="button"
                onClick={(e) => {
                  openerRef.current = e.currentTarget;
                  setOpen(i);
                }}
                aria-haspopup="dialog"
                aria-label={`${stage.title} — read more about this stage`}
                className="group flex w-full items-start gap-5 py-8 text-left md:gap-10 md:py-12"
              >
                {/* Circle and its connector. The connector lives inside the
                    flying element rather than the slot, so it travels with its
                    own row instead of hanging in the empty layout waiting for
                    one to arrive. */}
                <span className="relative flex shrink-0 flex-col items-center self-stretch">
                  <span className="mono grid h-12 w-12 place-items-center rounded-full border border-blue text-blue transition-colors duration-300 group-hover:bg-blue group-hover:text-ink md:h-16 md:w-16">
                    {stage.n}
                  </span>
                  {i < PROCESS.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="mt-3 w-px flex-1 bg-[color-mix(in_oklab,var(--blue)_38%,transparent)] transition-colors duration-300 group-hover:bg-blue"
                    />
                  ) : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="display block text-step-3 transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transform-none">
                    {stage.title}
                  </span>
                  <span className="mt-3 block max-w-[52ch] text-step-0 text-content-dim">
                    {stage.summary}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="mono shrink-0 self-center text-blue opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  ↗
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open !== null ? (
          <StagePanel stage={PROCESS[open]} onClose={close} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export default ProcessLadder;
