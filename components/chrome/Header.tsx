"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PRIMARY_NAV, SITE } from "@/lib/site";
import PuzzleMark from "@/components/brand/PuzzleMark";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header() {
  const pathname = usePathname();
  // The open panel is tagged with the path it was opened on, so a route change
  // closes it by derivation rather than by an effect that fires after paint.
  const [openState, setOpenState] = useState<{
    label: string;
    path: string;
  } | null>(null);
  const openLabel =
    openState && openState.path === pathname ? openState.label : null;

  const triggerRef = useRef<HTMLButtonElement>(null);
  /* Escape closes the panel and returns focus to the trigger — but that focus()
     call fires the wrapper's onFocus, which would reopen the panel instantly.
     This flag makes the very next focus a no-op. Cleared on focus-out so a
     later Tab back in still opens normally. */
  const suppressFocusOpen = useRef(false);

  const close = useCallback(() => setOpenState(null), []);

  const openPanel = useCallback(
    (label: string) => setOpenState({ label, path: pathname }),
    [pathname],
  );

  // Esc closes and returns focus to the trigger that opened it.
  //
  // There is deliberately no focus trap here. This is a menu, not a modal:
  // Tab should walk through the options and then continue out of the panel,
  // which closes it via onBlur below. The previous trap made Tab cycle inside
  // the panel with no way out except Escape.
  useEffect(() => {
    if (!openLabel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      suppressFocusOpen.current = true;
      close();
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openLabel, close]);

  const openItem = PRIMARY_NAV.find((n) => n.label === openLabel);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Backdrop is rendered OUTSIDE the hover wrapper on purpose. Inside it,
          this full-viewport element would count as part of the wrapper's hover
          region and the panel could never close on mouse-leave. */}
      <AnimatePresence>
        {openItem ? (
          <motion.div
            className="fixed inset-0 -z-10 bg-ink/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            aria-hidden="true"
          />
        ) : null}
      </AnimatePresence>

      <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label={`${SITE.name} — home`}
          onFocus={close}
        >
          <PuzzleMark
            variant="solid"
            className="h-7 w-7 text-blue transition-transform duration-500 group-hover:rotate-45"
            style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
          />
          <span className="wordmark text-step-1 lowercase leading-none">
            {SITE.wordmark}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {PRIMARY_NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            if (!item.columns) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mono rounded-full px-3 py-2 transition-colors hover:text-blue ${
                    active ? "text-blue" : "text-content-dim"
                  }`}
                  onMouseEnter={close}
                  onFocus={close}
                >
                  {item.label}
                </Link>
              );
            }

            const isOpen = openLabel === item.label;
            const panelId = `nav-panel-${item.label.replace(/\s+/g, "-").toLowerCase()}`;

            return (
              /* ------------------------------------------------------------
                 The shared hover/focus parent.
                 Both the trigger and the panel live inside this one
                 positioned container, so the pointer never leaves it while
                 travelling between them. `group` exposes the same state to
                 CSS (group-hover / group-focus-within) for anything that
                 wants it; visibility itself stays state-driven because
                 AnimatePresence needs to own mount/unmount for the exit
                 animation, and aria-expanded has to reflect it too.
                 ------------------------------------------------------------ */
              <div
                key={item.href}
                className="group relative"
                onMouseEnter={() => openPanel(item.label)}
                onMouseLeave={close}
                onFocus={() => {
                  if (suppressFocusOpen.current) {
                    suppressFocusOpen.current = false;
                    return;
                  }
                  openPanel(item.label);
                }}
                onBlur={(e) => {
                  // Only close when focus leaves the wrapper entirely —
                  // moving between the trigger and its own links must not.
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    suppressFocusOpen.current = false;
                    close();
                  }
                }}
              >
                <button
                  ref={isOpen ? triggerRef : undefined}
                  className={`mono rounded-full px-3 py-2 transition-colors hover:text-blue ${
                    active || isOpen ? "text-blue" : "text-content-dim"
                  }`}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  aria-controls={isOpen ? panelId : undefined}
                  onClick={() => (isOpen ? close() : openPanel(item.label))}
                >
                  {item.label}
                </button>

                <AnimatePresence>
                  {isOpen ? (
                    /* `top-full` starts this element exactly at the trigger's
                       bottom edge — no gap to cross. The visual breathing room
                       is `pt-3` INSIDE this element, so the spacing is itself
                       part of the hover region and bridges trigger to panel.
                       x is animated rather than set via -translate-x-1/2
                       because Framer writes `transform` inline and would
                       otherwise overwrite the Tailwind translate class. */
                    <motion.div
                      id={panelId}
                      className="absolute left-1/2 top-full z-20 pt-3"
                      initial={{ opacity: 0, y: -12, x: "-50%" }}
                      animate={{ opacity: 1, y: 0, x: "-50%" }}
                      exit={{ opacity: 0, y: -12, x: "-50%" }}
                      transition={{ duration: 0.32, ease: EASE }}
                    >
                      <div className="w-[min(44rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-rule bg-ink-raised">
                        <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
                          {item.columns.map((col) => (
                            <div key={col.heading}>
                              <p className="mono mb-4 text-content-dim">
                                {col.heading}
                              </p>
                              <ul className="grid gap-1">
                                {col.links.map((link) => (
                                  <li key={link.href}>
                                    <Link
                                      href={link.href}
                                      className="group/link block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
                                    >
                                      <span className="text-step-0 transition-colors group-hover/link:text-blue">
                                        {link.label}
                                      </span>
                                      {link.description ? (
                                        <span className="mt-0.5 block text-step--1 text-content-dim">
                                          {link.description}
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}

          <Link
            href="/contact"
            className="mono ml-2 rounded-full border border-rule px-4 py-2 transition-colors hover:border-coral hover:text-coral"
            onMouseEnter={close}
            onFocus={close}
          >
            Start a project
          </Link>
        </nav>

        {/* Mobile: the palette is the nav. Cheaper than a second menu system. */}
        <button
          className="mono rounded-full border border-rule px-4 py-2 md:hidden"
          onClick={() =>
            document.dispatchEvent(new CustomEvent("puzzle:open-palette"))
          }
        >
          Menu
        </button>
      </div>
    </header>
  );
}

export default Header;
