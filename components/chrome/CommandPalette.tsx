"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_ROUTES } from "@/lib/site";
import { navigateWithTransition } from "@/components/motion/route-transition-bus";

/**
 * ⌘K route jumper. Doubles as the mobile menu — the header dispatches
 * `puzzle:open-palette` rather than maintaining a second navigation system.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ROUTES.slice(0, 8);
    return ALL_ROUTES.filter((r) => r.label.toLowerCase().includes(q)).slice(
      0,
      8,
    );
  }, [query]);

  useEffect(() => {
    const reset = () => {
      setQuery("");
      setIndex(0);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        restoreFocus.current = document.activeElement as HTMLElement;
        reset();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => {
      restoreFocus.current = document.activeElement as HTMLElement;
      reset();
      setOpen(true);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("puzzle:open-palette", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("puzzle:open-palette", onOpen);
    };
  }, []);

  /* Announce open/closed so chrome that has to stay put while the palette is up
     — the sticky header — can pin itself without reaching into this component's
     state. Attribute rather than event, so a listener mounting late still reads
     the correct value. */
  useEffect(() => {
    document.documentElement.dataset.paletteOpen = open ? "true" : "false";
    document.dispatchEvent(
      new CustomEvent("puzzle:palette-state", { detail: { open } }),
    );
  }, [open]);

  // Focus only — the query/index reset happens where the palette is opened, so
  // this effect touches the DOM rather than cascading more renders.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      restoreFocus.current?.focus?.();
    }
  }, [open]);

  /* Through the route transition where it is mounted, so a jump from the
     palette is the same move as a click on a link — these are buttons, so the
     transition's own anchor listener can never see them. Falls back to a plain
     push when nothing is listening. */
  const go = (href: string) => {
    setOpen(false);
    if (!navigateWithTransition(href)) router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(results.length, 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    }
    if (e.key === "Enter" && results[index]) {
      e.preventDefault();
      go(results[index].href);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start justify-center bg-ink/70 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Jump to a page"
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-rule bg-ink-raised"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              placeholder="Jump to…"
              aria-label="Search pages"
              aria-controls="palette-results"
              className="w-full bg-transparent px-5 py-4 text-step-0 outline-none placeholder:text-content-dim"
            />
            <ul
              id="palette-results"
              className="max-h-80 overflow-y-auto border-t border-rule"
            >
              {results.length ? (
                results.map((r, i) => (
                  <li key={r.href}>
                    <button
                      className={`flex w-full items-center justify-between px-5 py-3 text-left transition-colors ${
                        i === index ? "bg-surface text-blue" : "text-content"
                      }`}
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => go(r.href)}
                    >
                      <span className="text-step--1">{r.label}</span>
                      <span className="mono text-content-dim">{r.href}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-5 py-8 text-center">
                  <p className="text-step--1 text-content-dim">
                    Nothing matches “{query}”.
                  </p>
                  <button
                    className="mono mt-3 text-blue underline underline-offset-4"
                    onClick={() => setQuery("")}
                  >
                    Clear and see everything
                  </button>
                </li>
              )}
            </ul>
            <p className="mono border-t border-rule px-5 py-3 text-content-dim">
              ↑↓ to move · ↵ to open · esc to close
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default CommandPalette;
