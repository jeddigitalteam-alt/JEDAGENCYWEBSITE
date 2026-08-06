"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import RevealHeading from "@/components/motion/RevealHeading";

/* ------------------------------------------------------------------ palette */

export const LAB = {
  blue: "#12A8FF",
  blueSoft: "#38B6FF",
  coral: "#FF9B79",
  chalk: "#E0E0E0",
  ink: "#0F0F12",
  raised: "#1B1D21",
} as const;

/* ------------------------------------------------------------------- canvas */

/**
 * Size a canvas to its wrapper in CSS pixels while drawing at device
 * resolution. Returns the CSS size; the 2D context is pre-scaled so every
 * experiment can draw in plain CSS units and forget DPR exists.
 */
export function fitCanvas(canvas: HTMLCanvasElement, wrap: HTMLElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

/** Re-run a callback whenever the element's box changes. */
export function useResize(
  ref: RefObject<HTMLElement | null>,
  onResize: () => void,
) {
  const cb = useRef(onResize);
  // Kept current in an effect rather than during render: writing a ref while
  // rendering is not allowed, and the observer only ever fires after commit.
  useEffect(() => {
    cb.current = onResize;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => cb.current());
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
}

/**
 * Whether an element is near the viewport. Every continuous loop on this page
 * gates on it, so nothing burns frames while scrolled away.
 */
export function useNearViewport(
  ref: RefObject<HTMLElement | null>,
  rootMargin = "300px",
) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setNear(entries[0]?.isIntersecting ?? false),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return near;
}

/* ------------------------------------------------------------------ section */

/**
 * One experiment. `bleed` breaks the page gutter for the immersive ones; the
 * rest sit in the normal measure. Deliberately not a card — the frame around
 * the interactive area is each experiment's own business.
 */
export function LabSection({
  index,
  roman,
  italic,
  line,
  children,
  bleed = false,
  aside,
}: {
  index: string;
  roman: string;
  italic: string;
  line: string;
  children: ReactNode;
  bleed?: boolean;
  aside?: ReactNode;
}) {
  return (
    <section className="mt-28 md:mt-36">
      <div
        className={
          aside
            ? "flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
            : ""
        }
      >
        <div>
          <p className="mono text-content-dim">Labs — {index}</p>
          <RevealHeading
            as="h2"
            className="display mt-3 max-w-[18ch] text-step-4"
            roman={roman}
            italic={italic}
          />
          <p className="mt-4 max-w-[56ch] text-step-0 text-content-dim">
            {line}
          </p>
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      <div
        className={
          bleed
            ? "mt-10 -mx-5 md:-mx-8"
            : "mt-10"
        }
      >
        {children}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- controls */

export function LabSlider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const id = `lab-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={id} className="flex min-w-[9rem] flex-1 flex-col gap-1.5">
      <span className="mono flex items-baseline justify-between text-content-dim">
        <span>{label}</span>
        <span className="tabular-nums">
          {Math.round(value * 100) / 100}
          {suffix}
        </span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lab-range"
      />
    </label>
  );
}

export function LabButton({
  children,
  onClick,
  disabled,
  tone = "rule",
  pressed,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "rule" | "coral";
  pressed?: boolean;
}) {
  const base =
    "mono rounded-full border px-5 py-2.5 transition-colors disabled:opacity-40";
  const skin = pressed
    ? "border-blue text-blue"
    : tone === "coral"
      ? "border-rule enabled:hover:border-coral enabled:hover:text-coral"
      : "border-rule enabled:hover:border-blue enabled:hover:text-blue";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={`${base} ${skin}`}
    >
      {children}
    </button>
  );
}

/** Segmented mode switch. Real radios, so arrow keys and labels work. */
export function LabModes<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{label}</legend>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <label
            key={o.value}
            className={`mono cursor-pointer rounded-full border px-4 py-2 transition-colors ${
              on
                ? "border-blue text-blue"
                : "border-rule text-content-dim hover:border-blue hover:text-blue"
            }`}
          >
            <input
              type="radio"
              name={`mode-${label.replace(/\s+/g, "-")}`}
              className="sr-only"
              checked={on}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        );
      })}
    </fieldset>
  );
}

/** Row under an experiment holding its controls. */
export function LabControls({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-4 px-5 md:px-8">
      {children}
    </div>
  );
}

/** The one-line hint that sits inside an experiment's frame. */
export function LabHint({ children }: { children: ReactNode }) {
  return (
    <p className="mono pointer-events-none absolute bottom-4 left-4 right-4 text-content-dim">
      {children}
    </p>
  );
}
