import Link from "next/link";
import { Eyebrow } from "@/components/ui/primitives";
import RevealHeading from "@/components/motion/RevealHeading";
import { SITE } from "@/lib/site";
import PuzzleSiteLogo from "@/components/brand/PuzzleSiteLogo";

/**
 * The closing block: a full-bleed blue field with the ask on the left and an
 * original sticker on the right.
 *
 * `data-blue` is the site's third structural surface, alongside ink and paper —
 * already used by the footer and the homepage peek that previews it. Reusing it
 * means the whole block flips through the token layer: `text-content`,
 * `border-rule` and the pill below all resolve to their on-blue values with no
 * per-element colours here. It also means the contrast decision is already
 * made — ink on blue at 7.4:1, never white on blue at 2.6:1.
 *
 * Contact details are read from `lib/site.ts` rather than written in. Nothing
 * is invented: the email and location are the ones the site already publishes.
 */
export function AboutCta() {
  return (
    <section
      data-blue
      className="bg-surface px-5 py-24 text-content md:px-8 md:py-32"
    >
      <div className="mx-auto grid w-full max-w-[100rem] items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Eyebrow>Got something in mind?</Eyebrow>
          <RevealHeading
            as="h2"
            className="display mt-4 max-w-[18ch] text-step-5"
            roman="Want to book an"
            italic="intro meeting with us?"
          />
          <p className="mt-8 max-w-[50ch] text-step-1 text-content-dim">
            Have a project in mind, or just want to talk an idea through? Tell
            us where you&rsquo;re at and we&rsquo;ll take it from there.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* Ink on blue: the primary pill's own colours would put blue on
                blue here, so this is the one place the button is restated. */}
            <Link
              href="/contact"
              className="mono inline-flex items-center gap-2 rounded-full bg-content px-6 py-3 text-surface transition-opacity duration-200 hover:opacity-90"
            >
              Book an intro
              <span aria-hidden="true">→</span>
            </Link>
            {/* The second route is the scope board, not a duplicate of the
                first — someone who already knows the shape of the work can
                skip the conversation and build it. */}
            <Link
              href="/services#scope"
              className="mono inline-flex items-center gap-2 rounded-full border border-content px-6 py-3 text-content transition-colors duration-200 hover:bg-content hover:text-surface"
            >
              Start a project
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href={`mailto:${SITE.email}`}
              className="mono text-content-dim underline decoration-1 underline-offset-4 transition-colors hover:text-content"
            >
              {SITE.email}
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <MarkSticker className="mx-auto w-full max-w-[20rem] lg:ml-auto lg:mr-0" />
        </div>
      </div>
    </section>
  );
}

/**
 * The mark, on a sticker.
 *
 * This replaced a drawing of two jigsaw pieces meeting. It said the same thing
 * less well: the studio already owns a puzzle piece, and an illustration of one
 * sitting next to the real one is a second version of the logo rather than a
 * graphic.
 *
 * The piece is `PuzzleSiteLogo` — the traced site mark from
 * `puzzle-site-mark.ts`, the same geometry the header and the cursor use. Not
 * redrawn and not approximated, and the wordmark is not part of it: that
 * component is the piece alone, with "puzzle" set as type beside it wherever
 * the full lockup appears.
 *
 * The white blob is the sticker language the service icons established. It
 * drifts on the shared `float` keyframe — CSS, no JavaScript — and
 * `motion-reduce` stops it outright.
 */
function MarkSticker({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative animate-[float_7s_ease-in-out_infinite] motion-reduce:animate-none ${className}`}
    >
      <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false" className="w-full">
        <path
          d="M22 62 C20 38 40 17 66 20 C92 23 120 12 142 26 C166 41 180 68 174 94 C169 116 187 142 168 160 C150 177 118 182 92 180 C64 178 38 174 27 154 C15 132 20 104 22 84 Z"
          fill="var(--paper)"
          stroke="var(--blue-lift)"
          strokeWidth={5}
          strokeLinejoin="round"
        />
      </svg>
      {/* Centred over the blob. `keyline="none"` because the piece is sitting
          on white here rather than on the dark header, where the keyline is
          what separates it from the field behind it. */}
      <PuzzleSiteLogo
        keyline="none"
        className="absolute left-1/2 top-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}

export default AboutCta;
