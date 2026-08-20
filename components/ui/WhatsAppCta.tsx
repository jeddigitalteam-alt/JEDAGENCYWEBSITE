import { WhatsAppMark } from "@/components/brand/social-marks";
import { whatsappHref } from "@/lib/site";

/** WhatsApp's own green. The one colour on this site that is not a token —
 *  deliberately, because the point of it is to be recognised instantly. */
const WHATSAPP_GREEN = "#25D366";

/**
 * A quiet, low-friction alternative to the blue CTA.
 *
 * Deliberately *not* the big blue strip: this is a single line with a rule
 * above and below it, the weight of a footnote rather than a section. Dropped
 * into a long editorial run it offers a conversation without the page turning
 * into a pitch, which is why it appears once per page at most and never beside
 * another call to action.
 *
 * **It always renders.** When `CONTACT_CHANNELS.whatsappNumber` is `null` —
 * which it is today, because there is no Puzzle number in this repository —
 * the strip is drawn exactly as it will look when it works, but as a `<div>`
 * rather than an `<a>`: no href, not in the tab order, nothing to follow. A
 * `wa.me` link built from a guessed number would message a stranger, and
 * `href="#"` would scroll the page to the top and look broken.
 *
 * Nothing about it reads as unfinished — no "coming soon", no grey-out, same
 * type, same green, same layout. The only thing the inactive version drops is
 * hover feedback, because a row that lights up under the cursor is a promise
 * that clicking does something.
 *
 * Put a number in the config and every placement becomes a live link with no
 * change to this file.
 *
 * The mark keeps WhatsApp green while the type around it stays in the page's
 * own token layer — recolouring the glyph to Puzzle blue would lose the only
 * thing that makes it readable at a glance.
 */
export function WhatsAppCta({
  className = "",
  message,
}: {
  className?: string;
  /** Overrides the shared prefill where a page can be more specific. */
  message?: string;
}) {
  const href = whatsappHref(message);

  /* One set of children, rendered into whichever wrapper is honest. Written
     once so the two states cannot drift apart visually. */
  const inner = (
    <>
      <span
        aria-hidden="true"
        className={`grid size-11 shrink-0 place-items-center rounded-full ${
          href
            ? "transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
            : ""
        }`}
        style={{ backgroundColor: WHATSAPP_GREEN }}
      >
        {/* White on the green disc: the mark as people know it. */}
        <WhatsAppMark className="size-6 text-white" />
      </span>

      <span className="flex-1">
        <span className="display block text-step-1">
          Easier to talk on WhatsApp?
        </span>
        <span className="mt-1 block text-step--1 text-content-dim">
          Send us a message.
        </span>
      </span>

      <span className="mono inline-flex items-center gap-2 text-blue">
        Message us
        <span
          aria-hidden="true"
          className={
            href ? "transition-transform duration-300 group-hover:translate-x-1" : ""
          }
        >
          →
        </span>
      </span>
    </>
  );

  const row = "flex flex-wrap items-center gap-x-5 gap-y-3";

  return (
    <section
      className={`border-y border-rule py-8 md:py-10 ${className}`}
      aria-label="Message us on WhatsApp"
    >
      {href ? (
        /* The whole strip is the target — a 44px-plus row rather than a small
           pill at the end of a line. */
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group ${row}`}
        >
          {inner}
        </a>
      ) : (
        <div className={row}>{inner}</div>
      )}
    </section>
  );
}

export default WhatsAppCta;
