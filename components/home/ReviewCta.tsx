import { CONTACT_CHANNELS } from "@/lib/site";

/**
 * "Leave a review", set beside the testimonials.
 *
 * The testimonial column is a wide measure of display type with a great deal of
 * empty page to its right. Stretching the quotes into it would have made them
 * harder to read; this fills it with the one thing that section is actually
 * asking for.
 *
 * Built from the same pieces as the quotes it sits next to — the five stars are
 * the ones `TestimonialQuote` draws, at the same size, so the panel reads as
 * part of the group rather than as an advert dropped beside it. The blue is the
 * accent, not the field: a solid blue block here would out-shout the quotes.
 *
 * **No review URL is invented.** `CONTACT_CHANNELS.reviewUrl` is `null` today,
 * and — exactly as with WhatsApp and Facebook — the panel renders identically
 * either way. With a URL it is an `<a>`; without one the same markup renders as
 * a `<div>` with no href, nothing to follow and no hover promise. Add the URL
 * and it becomes a link with no change here.
 */
export function ReviewCta({ className = "" }: { className?: string }) {
  const href = CONTACT_CHANNELS.reviewUrl;

  const inner = (
    <>
      {/* Five stars, filled — the same glyph the quotes above use. */}
      <span aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" className="size-5 text-blue" fill="currentColor">
            <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8Z" />
          </svg>
        ))}
      </span>

      <p className="mono mt-8 text-content-dim">Have we worked together?</p>
      <p className="display mt-4 max-w-[16ch] text-step-3">
        Leave Puzzle <em>a review</em>
      </p>
      <p className="mt-4 max-w-[34ch] text-step--1 text-content-dim">
        If we have worked together, we would like to hear what you thought — the
        useful parts and the awkward ones.
      </p>

      <span
        className={`mono mt-10 inline-flex items-center gap-2 text-blue ${
          href ? "transition-transform duration-300 group-hover:translate-x-1" : ""
        }`}
      >
        Leave a review
        <span aria-hidden="true">→</span>
      </span>
    </>
  );

  /* One border and a lot of air, like the phase tiles on a service page. The
     blue keyline on hover is the only state change, and only when it links. */
  const shell = `flex h-full flex-col rounded-2xl border border-rule p-8 md:p-10 ${
    href ? "group transition-colors hover:border-blue" : ""
  } ${className}`;

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={shell}>
      {inner}
    </a>
  ) : (
    <div className={shell}>{inner}</div>
  );
}

export default ReviewCta;
