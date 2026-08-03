import type Lenis from "lenis";

/**
 * The single live Lenis instance, shared between the component that owns its
 * lifecycle (SmoothScroll) and the one that owns scroll position (ScrollToTop).
 *
 * Lenis keeps its own idea of where the page is scrolled and writes it back on
 * every frame. A bare `window.scrollTo(0, 0)` therefore only moves the document
 * until Lenis's next frame restores its own target — so the reset has to be
 * told to Lenis rather than performed behind its back.
 *
 * Module state rather than context: this is a single browser-wide object, and
 * nothing renders differently because of it.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}

/** Jump to the top immediately, keeping Lenis's internal position in step. */
export function resetScroll() {
  const lenis = instance;
  if (lenis) {
    // Re-measure first: the incoming route is a different height, and a stale
    // limit would clamp this call against the old page's bounds.
    lenis.resize();
    lenis.scrollTo(0, { immediate: true, force: true });
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}
