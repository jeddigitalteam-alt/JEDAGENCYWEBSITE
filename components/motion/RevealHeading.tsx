"use client";

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIntro } from "@/components/motion/intro-context";
import { useReducedMotionPref } from "@/lib/hooks/useMediaQuery";

/**
 * Line-by-line masked reveal for a heading.
 *
 * Each rendered line gets its own `overflow: hidden` mask and rises into it,
 * staggered, once the heading reaches the viewport. It plays once and stays.
 *
 * The lines are the ones the browser actually produced — the component renders
 * the heading normally first, measures where each word landed, groups the words
 * by line and only then wraps them. Nothing decides the line breaks except the
 * type itself, so `text-wrap: balance`, the `max-w-[NNch]` measures and every
 * existing break survive untouched. That measure-then-wrap pass runs in a
 * layout effect, so the browser never paints the unwrapped state.
 *
 * The mask idiom is the hero's, which established it: `.display` runs a 0.92
 * line-height, so a mask cut to the line box slices the tail off a "g". The
 * padding drops the clip edge below the baseline and the matching negative
 * margin takes the space straight back, so the heading's size and spacing do
 * not move. Only the bottom is padded — padding both sides would put two
 * negative margins between adjacent masks, and CSS collapses those to the
 * single most-negative value rather than summing them, which would space the
 * lines out.
 */

/** Matches --ease-lock, the site's expo-out. */
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const RISE_MS = 900;
const FADE_MS = 620;
/** Stagger between lines. */
const STEP_MS = 110;
/** How far the clip edge sits below the line box. */
const PAD = "0.22em";
/**
 * The brief's ~110%, plus the descender allowance — because the mask now
 * extends PAD below the line box, a line pushed down by 110% of itself would
 * still show a sliver of its ascenders. Works out around 133% at these sizes,
 * which is the hero's hand-tuned 135%.
 */
const HIDDEN = `translateY(calc(110% + ${PAD}))`;

/** A heading word, and whether the space before it belonged inside the <em>. */
type Word = { text: string; em: boolean; emSpace: boolean };

function toWords(roman: string, italic?: string): Word[] {
  const out: Word[] = [];
  for (const t of roman.trim().split(/\s+/))
    if (t) out.push({ text: t, em: false, emSpace: false });
  const it = italic?.trim().split(/\s+/).filter(Boolean) ?? [];
  it.forEach((t, i) =>
    /* In the original markup the space before the italic run sat outside the
       <em> and the spaces within it sat inside. Italic carries its own
       letter-spacing, so a space moved across that boundary is a different
       width — and a different width is a different line break. Each space
       stays where it was. */
    out.push({ text: t, em: true, emSpace: i > 0 }),
  );
  return out;
}

export type RevealHeadingProps = {
  roman: string;
  italic?: string;
  className?: string;
  id?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  /** Opt out where the heading already has an entrance of its own. */
  reveal?: boolean;
};

export function RevealHeading({
  roman,
  italic,
  className = "",
  id,
  as: As = "h2",
  reveal = true,
}: RevealHeadingProps) {
  const words = useMemo(() => toWords(roman, italic), [roman, italic]);
  const hostRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<(HTMLElement | null)[]>([]);
  /** Word indices per line, or null until measured. */
  const [lines, setLines] = useState<number[][] | null>(null);
  const [shown, setShown] = useState(false);
  const measuredAt = useRef(0);

  const reduced = useReducedMotionPref();
  const { shouldRun, introDone } = useIntro();
  /* Nothing reveals from behind the intro loader: a heading above the fold
     would otherwise play and finish while the overlay still covered it, and
     the reader would arrive to a page that had already used its entrance. */
  const cued = shouldRun === false || introDone;
  const active = reveal && !reduced;

  /* Measure, then wrap — before the browser paints, so the flat pass is never
     seen. Re-runs only when the width changes, since height cannot alter where
     the lines break. */
  useLayoutEffect(() => {
    const host = hostRef.current;
    // A measurement already committed stays valid until the width changes, so
    // there is nothing to undo when the effect is inactive — the render path
    // below returns the plain heading without consulting `lines` at all.
    if (!active || !host || lines) return;

    const els = wordRefs.current;
    const groups: number[][] = [];
    let top = Number.NaN;
    for (let i = 0; i < words.length; i++) {
      const el = els[i];
      if (!el) continue;
      // getClientRects()[0], not the bounding box: a word is unbreakable, so
      // its first rect is its line, while the bounding box of anything that
      // did wrap would span two.
      const t = (el.getClientRects()[0] ?? el.getBoundingClientRect()).top;
      if (groups.length === 0 || t - top > 2) {
        groups.push([i]);
        top = t;
      } else {
        groups[groups.length - 1].push(i);
      }
    }
    measuredAt.current = host.getBoundingClientRect().width;
    /* Measure-then-commit, the one case the lint rule is not aimed at: where a
       line breaks is not derivable from props, only from what the browser did
       with them, so this state genuinely cannot be computed during render. The
       cascade the rule guards against is bounded at exactly one extra render —
       `lines` is the guard that stops it re-entering — and because this is a
       layout effect, React flushes that render before the browser paints, so
       the unwrapped pass is never on screen. The alternative, wrapping the
       lines by hand in the DOM, would put this subtree at odds with React in
       components that re-render (FitNotes, ServicesPanels). */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (groups.length) setLines(groups);
  }, [active, lines, words]);

  /* A width change can re-break the lines. Drop back to the flat pass and let
     the layout effect above measure again. Once revealed the flat pass and the
     wrapped pass render identically, so the round trip is invisible. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !active) return;
    const ro = new ResizeObserver(() => {
      const w = host.getBoundingClientRect().width;
      if (Math.abs(w - measuredAt.current) < 1) return;
      measuredAt.current = w;
      setLines(null);
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, [active]);

  /* Fires once. The observer is dropped on the first crossing, so scrolling
     back up and down again cannot replay or reverse it. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !active || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        setShown(true);
      },
      // A little inside the fold, so the reveal reads as a response to the
      // heading arriving rather than firing at the very edge of the screen.
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [active, shown]);

  const lit = shown && cued;

  /** The separator that preceded a word, kept on the correct side of the em. */
  const gap = (w: Word, first: boolean): ReactNode =>
    first ? null : w.emSpace ? <em> </em> : " ";

  if (!active) {
    // Reduced motion, or opted out: the heading exactly as authored.
    return (
      <As id={id} className={className}>
        {words.map((w, i) => (
          <Fragment key={i}>
            {gap(w, i === 0)}
            {w.em ? <em>{w.text}</em> : w.text}
          </Fragment>
        ))}
      </As>
    );
  }

  if (!lines) {
    // Measuring pass. Identical output to the block above, with the words
    // individually addressable. Committed before paint.
    return (
      <As
        id={id}
        className={className}
        ref={hostRef as React.Ref<HTMLHeadingElement>}
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            {gap(w, i === 0)}
            <span
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
            >
              {w.em ? <em>{w.text}</em> : w.text}
            </span>
          </Fragment>
        ))}
      </As>
    );
  }

  return (
    <As
      id={id}
      className={className}
      ref={hostRef as React.Ref<HTMLHeadingElement>}
      /* Contains the last mask's negative bottom margin. Without a formatting
         context that margin collapses straight out through the heading, so the
         heading's own box ends up PAD taller than the type it holds — measured
         at +27.8px on the larger headings — and anything aligning to its edge,
         like the `items-end` rows the section headings sit in, moves with it.
         Contained, the box comes out at exactly N x line-height, which is what
         the unsplit heading measured. */
      style={{ display: "flow-root" }}
    >
      {lines.map((line, li) => (
        <span
          key={li}
          className="block overflow-hidden"
          style={{ paddingBottom: PAD, marginBottom: `-${PAD}` }}
        >
          <span
            className="block"
            style={{
              transform: lit ? "translateY(0)" : HIDDEN,
              opacity: lit ? 1 : 0,
              transition: `transform ${RISE_MS}ms ${EASE} ${li * STEP_MS}ms, opacity ${FADE_MS}ms linear ${li * STEP_MS}ms`,
              willChange: lit ? undefined : "transform, opacity",
            }}
          >
            {line.map((wi, k) => (
              <Fragment key={wi}>
                {gap(words[wi], k === 0)}
                {words[wi].em ? <em>{words[wi].text}</em> : words[wi].text}
              </Fragment>
            ))}
            {/* Keeps a word boundary between lines for anything reading the
                text content. Trailing whitespace at the end of a line box is
                dropped when rendering, so it costs nothing visually. */}
            {li < lines.length - 1 ? " " : null}
          </span>
        </span>
      ))}
    </As>
  );
}

export default RevealHeading;
