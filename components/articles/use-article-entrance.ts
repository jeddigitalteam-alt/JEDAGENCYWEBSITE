"use client";

import { useReducedMotion } from "motion/react";
import { useIntro } from "@/components/motion/intro-context";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";

/**
 * One entrance, shared by the feature and the rows.
 *
 * `useInViewOnce` latches on first sight and never unsets, which is the site's
 * one-way rule. The addition here is the cue: nothing may play from behind a
 * cover. There are two — the intro loader on a first paint, and the route
 * transition's blue sheet on every navigation after it — and an article at the
 * top of the page would otherwise spend its entrance while the screen was
 * covered, so the reader arrives at a page that has already finished animating.
 * That is the same condition `RevealHeading` applies, for the same reason.
 *
 * Note `seen` still latches under the cover; only `lit` waits. Anything above
 * the fold therefore animates the instant the sheet clears, and anything below
 * it is still unseen and keeps its ordinary scroll trigger.
 */
export function useArticleEntrance<T extends HTMLElement>() {
  const reduced = useReducedMotion();
  const { shouldRun, introDone, covered } = useIntro();
  /* Reduced motion latches immediately: there is no entrance to stage, so the
     content should simply be present. */
  const { ref, seen } = useInViewOnce<T>({ immediate: reduced === true });
  const cued = (shouldRun === false || introDone) && !covered;

  return { ref, lit: seen && cued, reduced: reduced === true };
}

export default useArticleEntrance;
