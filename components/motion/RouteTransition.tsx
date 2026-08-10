"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import PuzzleMarkAnimation from "@/components/brand/PuzzleMarkAnimation";
import { useIntro } from "@/components/motion/intro-context";
import { setRouteNavigator } from "@/components/motion/route-transition-bus";

/* One movement, in three measured parts. The layer never changes direction: it
   rises to cover, waits while the route swaps underneath it, then keeps going
   the same way and off the top. 1.8s end to end.

   The covered beat is the only part that is a wait rather than a movement, so
   it is held to a tenth of a second — long enough for the seated mark to be
   read as an arrival, short enough that nothing here reads as loading. */
const COVER = 0.8;
const HOLD = 100;
const REVEAL = 0.9;

/* The mark's own beats, all inside the sheet's. Nothing here extends the
   transition; it fills time the wipe was already spending.

     0.34  pieces fade up, apart — the earliest the blue covers all of them
     0.48  fully visible, still apart
     0.50  they start closing
     0.86  seated, into the covered beat
     0.90  the sheet leaves, and they part again with it
     1.14  mark gone, while the centre of the screen is still blue

   The close starts well after the fade rather than alongside it, which is the
   loader's structure and not a detail: EASE_LOCK is expo-out and spends half
   its travel in the first tenth of its duration. Run together, as they were
   first written, the pieces were 90% closed by the time the mark reached full
   opacity — the connect happened, correctly and invisibly, behind a fade.
   Measured across the sequence rather than reasoned about; the numbers are in
   NOTES. */
const MARK_IN_AT = 0.34;
const MARK_IN_DUR = 0.14;
const LOCK_AT = 0.5;
const LOCK_DUR = 0.36;
const MARK_OUT_DUR = 0.24;
const PART_DUR = 0.34;

/**
 * Separation before the close, and after it.
 *
 * 2.2x the loader's, because the separation scales with the mark and this one
 * is 96px against the loader's 480: at 1x the pieces would travel six pixels
 * and "connecting" would be a word for something nobody could see. 2.2 puts it
 * at thirteen, which reads as two pieces meeting without becoming a gesture of
 * its own.
 *
 * They part again on the way out rather than simply fading. It is the truer
 * ending — the mark seats to close the old page and opens to let the new one
 * through — and it means the last thing on screen is still moving in the same
 * direction the sheet is, rather than a static logo dissolving.
 */
const ENTER_SEPARATION = 2.2;
const PART_SEPARATION = 0.55;

/**
 * Mark size: 1.5x what it was (3.5rem / 4rem), and still a tenth of the screen.
 *
 * `overflow-visible` is not decoration. A browser's UA stylesheet clips an
 * `<svg>` to its own box, and at 2.2x separation the pieces stand outside the
 * viewBox — so they were being drawn with their outer corners sliced flat.
 * Caught in a screenshot, not in the numbers. The loader never hits this, since
 * at 1x both pieces stay inside, so the class is set here rather than in the
 * shared component.
 */
const MARK_SIZE = "w-[5.25rem] overflow-visible md:w-24";

/**
 * In viewBox units, against the loader's 7. The mark is a fifth of the loader's
 * size, so 7 would render a 0.7px hairline — thinner on screen than the 12 this
 * carried at the smaller size, which would make the enlarged mark read as
 * weaker rather than stronger. 16 is ~1.5px, the same optical weight the loader
 * has at 480.
 */
const MARK_STROKE = 16;

/* Both curves are gentler than the first version's, because the same curve over
   twice the distance in time is not the same gesture.

   The cover was [.65,0,.35,1], a strong in-out. Its flat start is imperceptible
   over 380ms and reads as lag over 800 — the sheet has to answer the click, so
   the ease-in is eased off and it leaves immediately, still decelerating into
   its stop.

   The reveal was the site's expo-out, [.16,1,.3,1]. Expo puts three quarters of
   the travel in the first fifth: over 520ms that is a snap away, but over 1.1s
   it leaves the sheet crawling the last sliver of the screen for most of a
   second. This one spends the time it is given — 39% / 75% / 95% of the travel
   at the quarters, against expo's 75% / 92% / 99% — while still leaving
   decisively, which is what keeps it reading as the cover continuing rather
   than a second, separate move. Neither curve overshoots. */
const EASE_COVER = [0.45, 0, 0.25, 1] as const;
const EASE_REVEAL = [0.33, 0.45, 0.5, 1] as const;

/* Reduced motion: no travel at all, on the sheet or in the mark. The mark is
   still shown — seated, never separated — so the transition still says whose
   site this is; it simply arrives rather than assembles. */
const FADE = 0.2;
const FADE_MARK_AT = 0.1;
const FADE_MARK_DUR = 0.12;

/**
 * If a route has not committed by now, reveal anyway. The blue would otherwise
 * sit there for as long as the network did, which is the one way this turns
 * into the loading screen it is meant not to be.
 */
const PATIENCE = 2800;

type Phase = "idle" | "cover" | "reveal";

/**
 * The route transition: a sheet of Puzzle blue that rises over the page, lets
 * the route change happen behind it, and carries on up and away.
 *
 * The order is the whole point. The previous version animated *after* the route
 * had already changed, so the cover was instantaneous and only the reveal was
 * ever seen — the outgoing page vanished before anything had covered it. Here
 * the click is intercepted, the cover is played to completion, and only then is
 * `router.push` called. Nothing about the new page — its first paint, its
 * scroll reset — is visible until the blue is over the viewport, and the reveal
 * does not start until the new route has actually committed.
 *
 * No link is rewritten to make this work. One capture-phase listener on the
 * document sees every anchor click before React does, and `next/link` checks
 * `defaultPrevented` before it navigates, so preventing the default is enough
 * to hand the navigation over. Prefetching, hover intent, `<Link>` semantics,
 * server components, metadata and scroll behaviour are all untouched: this
 * changes *when* the push happens, not what a link is.
 */
export function RouteTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const { shouldRun, introDone, uncover } = useIntro();

  const [phase, setPhase] = useState<Phase>("idle");
  /* Read from event and animation callbacks, which always run after a render
     has committed, so an effect-synced mirror is never stale where it is used.
     State drives what is drawn; this only answers "are we busy". */
  const phaseRef = useRef<Phase>("idle");

  /** Where we are going, while the cover is still playing. */
  const target = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** True while the intro loader owns the screen. Nothing here competes with it. */
  const introBusy = shouldRun !== false && !introDone;

  /* --- the route changed: derived during render, not in an effect ---------
     React's documented way to adjust state when an input changes, and here it
     is also the correct *timing*: doing it in an effect would leave a frame in
     which the new route has rendered while the sheet still believes it is
     covering. `seenPath` is state rather than a ref for the same reason
     IntroProvider's veil is — the comparison has to survive Strict Mode's
     double render rather than be consumed by the first pass. */
  const [seenPath, setSeenPath] = useState<string | null>(null);
  let current = phase;
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    // First mount is not a route change: the intro loader owns that moment.
    if (seenPath !== null) {
      /* In "cover" means this component started the navigation and the blue is
         already over the viewport, so the sheet carries on upward. Anything
         else means something else did — browser back/forward, most often — and
         there is nothing to reveal: covering retroactively would be a blue
         flash over a page already being looked at. */
      current = !introBusy && phase === "cover" ? "reveal" : "idle";
      if (current !== phase) setPhase(current);
    }
  }

  const begin = useCallback((href: string) => {
    /* Already going somewhere. A second click is dropped rather than queued:
       queueing means watching a transition you did not ask for, and running
       both means two sheets. */
    if (phaseRef.current !== "idle") return;
    target.current = href;
    phaseRef.current = "cover";
    setPhase("cover");
  }, []);

  /* Mirror the phase for the callbacks, and lower the provider's veil whenever
     we come to rest. The veil is raised on every route change, before anything
     can know whether a transition will play, so every path that does not play
     one has to put it back down or entrances on the arriving page wait for
     ever. Keyed on the pathname as well as the phase, because a navigation we
     did not run — back/forward — never changes the phase at all. */
  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "idle") {
      target.current = null;
      uncover();
    }
  }, [phase, pathname, uncover]);

  useEffect(
    () => () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    },
    [],
  );

  /* --- one listener, every link ------------------------------------------ */
  useEffect(() => {
    if (introBusy) return;

    const onClick = (event: MouseEvent) => {
      // Someone else has already claimed this click.
      if (event.defaultPrevented) return;
      /* Left button only, and never with a modifier: ctrl/cmd/shift/alt all
         mean "open this somewhere else", which is the browser's business and
         not ours to intercept. */
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const node = event.target;
      if (!(node instanceof Element)) return;
      const anchor = node.closest("a");
      if (!anchor || !anchor.getAttribute("href")) return;
      // Opens elsewhere, downloads, or has opted out explicitly.
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition !== undefined) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      /* Everything that is not a page on this site leaves through here: another
         origin, and `mailto:` / `tel:`, whose origin is the string "null" and
         can therefore never match. */
      if (url.origin !== window.location.origin) return;

      /* The pathname is what this reveals a change of, and it is also what it
         waits on: the reveal is keyed to `usePathname`. So anything landing on
         the path already showing is left alone — an anchor within the page, a
         link back to it, or a query-string change like the scope handover to
         /contact. Covering the screen for those would be theatre at best, and
         a sheet waiting on a pathname that never changes at worst. */
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      begin(url.pathname + url.search + url.hash);
    };

    /* Capture, not bubble: the anchor's own React handler runs in the bubble
       phase, so a bubble listener would arrive after the navigation had already
       begun. */
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [begin, introBusy]);

  /* Navigations that never touch an anchor — the ⌘K palette is a list of
     buttons calling router.push, and no click listener can see those. */
  useEffect(() => {
    if (introBusy) return;
    setRouteNavigator(begin);
    return () => setRouteNavigator(null);
  }, [begin, introBusy]);

  /* --- covered: change the route ----------------------------------------- */
  const onCovered = useCallback(() => {
    if (phaseRef.current !== "cover") return;
    const href = target.current;
    if (!href) return;
    pushTimer.current = setTimeout(() => router.push(href), HOLD);
  }, [router]);

  /* Nothing may hold the screen indefinitely. If the push has not committed by
     now, let the page through: the arriving route painting a moment after the
     blue has gone is still better than a blue wall. */
  useEffect(() => {
    if (current !== "cover") return;
    const id = setTimeout(() => {
      if (phaseRef.current !== "cover") return;
      phaseRef.current = "idle";
      setPhase("idle");
    }, PATIENCE);
    return () => clearTimeout(id);
  }, [current]);

  const onRevealed = useCallback(() => {
    phaseRef.current = "idle";
    setPhase("idle");
  }, []);

  if (current === "idle") return null;

  const covering = current === "cover";

  return (
    /* Wrapper, so the mark is a sibling of the sheet rather than a child of it.
       As a child it rode the translation: at two thirds of the way up, the
       "centred" mark sat near the bottom edge of the screen and the pieces
       would have closed while the whole thing was still travelling. Here the
       sheet moves and the mark holds the middle of the viewport, which is the
       only way the connect can be both centred and inside the cover.

       Above everything for the duration: header (50), footer peek (30), the
       palette and the process modal (95). Unmounted the instant the reveal
       lands, so nothing is left holding a stacking layer or swallowing clicks
       afterwards. Interactive while covering — a click during a committed
       navigation should not reach whatever is underneath — and transparent to
       the pointer on the way out. */
    <div
      className={`fixed inset-0 z-[110] ${
        covering ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden="true"
    >
      <motion.div
        data-route-transition={covering ? "cover" : "reveal"}
        className="absolute inset-0 bg-blue"
        style={{ willChange: "transform" }}
        initial={reduced ? { opacity: 0 } : { y: "100%" }}
        animate={
          reduced
            ? { opacity: covering ? 1 : 0 }
            : { y: covering ? "0%" : "-100%" }
        }
        transition={
          reduced
            ? { duration: FADE, ease: "linear" }
            : {
                duration: covering ? COVER : REVEAL,
                ease: covering ? EASE_COVER : EASE_REVEAL,
              }
        }
        onAnimationComplete={covering ? onCovered : onRevealed}
      />

      {/* The same two pieces the intro loader locks together, at the same
          curve, through the same component — the site has one connect and this
          is it. They fade up over blue that already covers the middle of the
          screen, close as the sheet finishes covering, and part again as it
          leaves. White on blue is the mark's own treatment, as in the footer.

          The outlines are not stroke-drawn here. That is the loader's opening
          beat, and by the time someone is changing routes they have seen the
          mark drawn; repeating it is a beat this has no room for. */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: covering ? 1 : 0 }}
        transition={{
          duration: reduced
            ? FADE_MARK_DUR
            : covering
              ? MARK_IN_DUR
              : MARK_OUT_DUR,
          delay: covering ? (reduced ? FADE_MARK_AT : MARK_IN_AT) : 0,
          ease: "easeOut",
        }}
      >
        <PuzzleMarkAnimation
          /* Seated throughout under reduced motion: shown, never assembled. */
          locked={reduced ? true : covering}
          separation={covering ? ENTER_SEPARATION : PART_SEPARATION}
          duration={covering ? LOCK_DUR : PART_DUR}
          delay={covering ? LOCK_AT : 0}
          reduced={Boolean(reduced)}
          strokeWidth={MARK_STROKE}
          className={`${MARK_SIZE} text-paper`}
        />
      </motion.div>
    </div>
  );
}

export default RouteTransition;
