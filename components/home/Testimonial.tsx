"use client";

import TestimonialQuote from "@/components/home/TestimonialQuote";
import {
  HOMEPAGE_TESTIMONIALS,
  type Testimonial as TestimonialData,
} from "@/lib/testimonials";

/**
 * One testimonial, as an editorial break between sections rather than a
 * testimonials component.
 *
 * The quote itself is `TestimonialQuote`, shared with the fit note further down
 * the page so the two are one system rather than two designs that resemble each
 * other. This component is now the staging: the section, and which quote.
 *
 * Takes the array and renders the first entry. Adding a second testimonial is a
 * change to `lib/testimonials.ts` alone — either drop the index here to map the
 * list, or pass a different one in.
 */
export function Testimonial({
  item = HOMEPAGE_TESTIMONIALS[0],
}: {
  item?: TestimonialData;
}) {
  if (!item) return null;

  return (
    /* The padding is the section: this is meant to read as a held breath
       between two dense blocks, so it is deliberately far more than the 24/32
       the neighbouring sections use. */
    <section className="px-5 py-32 md:px-8 md:py-48">
      <TestimonialQuote
        rating={item.rating}
        quote={item.quote}
        company={item.company}
        attribution={item.attribution}
      />
    </section>
  );
}

export default Testimonial;
