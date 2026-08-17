/**
 * Class-name join.
 *
 * `CoverflowCarousel` arrived written against a `cn()` from `@/lib/utils`, which
 * this project did not have — everything else here composes class strings with
 * template literals. Rather than rewrite the component's call sites (and risk
 * touching the thing that was supplied as the source of truth), the helper it
 * expects lives here.
 *
 * Deliberately not `clsx` + `tailwind-merge`: nothing in this codebase passes
 * conflicting utilities to be de-duplicated, and two dependencies for a filter
 * and a join is not a trade worth making. Same signature, so swapping in the
 * real thing later is a one-line change.
 */
export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export default cn;
