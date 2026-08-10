/**
 * The one way to navigate through the transition.
 *
 * Links are handled centrally — `RouteTransition` intercepts clicks on any
 * anchor in the document — but not every navigation on the site comes from an
 * anchor. The ⌘K palette is a list of buttons calling `router.push`, and an
 * anchor listener can never see those. Rather than teach the palette the
 * choreography, it asks here and falls back to a plain push if the transition
 * is not mounted (reduced motion, or before hydration).
 *
 * Module state rather than context, matching ./lenis-instance: there is exactly
 * one transition in the document, and nothing renders differently because of
 * it.
 */
type Navigator = (href: string) => void;

let navigator: Navigator | null = null;

export function setRouteNavigator(next: Navigator | null) {
  navigator = next;
}

/**
 * Navigate with the full-screen transition.
 *
 * Returns false if nothing is listening, so the caller can fall back to its own
 * `router.push` rather than silently doing nothing.
 */
export function navigateWithTransition(href: string): boolean {
  if (!navigator) return false;
  navigator(href);
  return true;
}
