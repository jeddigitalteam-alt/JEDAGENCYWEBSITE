/**
 * Testimonials for the homepage editorial break.
 *
 * An array because the section is built to take more than one later, even
 * though it shows the first today — adding a second is a data change, not a
 * component change. It is deliberately separate from `TESTIMONIALS` in
 * lib/team.ts: those are the short "fit notes" that seat against a named
 * project further down the page, and this is the single long-form quote given
 * the full editorial treatment. Merging them would mean one of the two
 * sections rendering copy written for the other.
 */

export interface Testimonial {
  /** Out of five. Rendered as that many filled stars. */
  rating: number;
  quote: string;
  company: string;
  /** Person and role, as one line — "Tom — Founder & CEO". */
  attribution: string;
}

export const HOMEPAGE_TESTIMONIALS: Testimonial[] = [
  {
    rating: 5,
    quote:
      "Super smooth process. Working with Puzzle felt effortless from the first conversation through to launch.",
    company: "South Downs Plant & Machinery",
    attribution: "Tom — Founder & CEO",
  },
];
