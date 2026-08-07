import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import RevealHeading from "@/components/motion/RevealHeading";

/** Mono micro-label. The LEVANT voice, used as the site-wide labelling system. */
export function Eyebrow({
  children,
  className = "",
  as: As = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div" | "h2";
}) {
  return <As className={`mono text-content-dim ${className}`}>{children}</As>;
}

/**
 * Section heading: roman + italic mix is the type signature.
 *
 * Rendered through RevealHeading, so every section heading on the site gets the
 * line-by-line masked entrance. Pass `reveal={false}` where the heading already
 * has an entrance of its own.
 */
export function SectionHeading({
  roman,
  italic,
  className = "",
  id,
  reveal,
}: {
  roman: string;
  italic?: string;
  className?: string;
  id?: string;
  reveal?: boolean;
}) {
  return (
    <RevealHeading
      as="h2"
      id={id}
      roman={roman}
      italic={italic}
      reveal={reveal}
      className={`display text-step-4 ${className}`}
    />
  );
}

type ButtonVariant = "primary" | "ghost";

const base =
  "mono inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  /**
   * Puzzle blue, from `--blue` — the mark's own colour, and the same token the
   * seam, the links and the process circles read from. Nothing here is a hex.
   *
   * `text-ink` is not a preference. `--blue` on `--ink` is 7.4:1, comfortably
   * past AA for body text; white on that same blue is 2.6:1 and fails outright
   * — the finding recorded in NOTES.md that shaped the token layer. Hover
   * lifts to `--blue-lift`, which raises the contrast rather than lowering it,
   * so the pressed and hovered states stay legible too.
   *
   * Coral is no longer the primary fill. It stays in the palette as the
   * LEVANT case study's accent and as the contact form's error colour, both of
   * which mean something specific; it is simply no longer what a call to
   * action looks like.
   */
  primary:
    "bg-blue text-ink hover:bg-blue-lift active:bg-blue-lift active:scale-[0.98]",
  ghost: "border border-rule text-content hover:border-blue hover:text-blue",
};

/**
 * The button's own classes, for the rare case where the pill has to sit on
 * something other than a <button> or a <Link> — the hero pairs it with a prompt
 * inside one link, so the pill is a span there. Exported rather than copied so
 * there is still one definition of what a button looks like.
 */
export const buttonClass = (variant: ButtonVariant = "ghost") =>
  `${base} ${variants[variant]}`;

export function Button({
  variant = "ghost",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "ghost",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

/**
 * Interlocking divider — the notch motif used structurally, as a join between
 * sections rather than a decorative sprinkle.
 */
export function Interlock({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-6 w-full ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full text-rule"
      >
        <path
          d="M0 12 H540 a24 24 0 0 1 0 0 a30 30 0 0 0 60 0 a24 24 0 0 1 0 0 H1200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/** Text link with the blue underline that survives inverted sections. */
export function TextLink({
  className = "",
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`underline decoration-[color:var(--link-underline)] decoration-1 underline-offset-4 transition-colors hover:text-blue ${className}`}
      style={{ color: "var(--link)" }}
      {...props}
    />
  );
}
