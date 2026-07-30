import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

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

/** Section heading: roman + italic mix is the type signature. */
export function SectionHeading({
  roman,
  italic,
  className = "",
  id,
}: {
  roman: string;
  italic?: string;
  className?: string;
  id?: string;
}) {
  return (
    <h2 id={id} className={`display text-step-4 ${className}`}>
      {roman}
      {italic ? (
        <>
          {" "}
          <em>{italic}</em>
        </>
      ) : null}
    </h2>
  );
}

type ButtonVariant = "primary" | "ghost";

const base =
  "mono inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  // Coral is the scarce primary. One per view, ideally.
  primary: "bg-coral text-ink hover:bg-paper",
  ghost: "border border-rule text-content hover:border-blue hover:text-blue",
};

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
