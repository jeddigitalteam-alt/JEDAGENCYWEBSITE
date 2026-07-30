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

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    setOpenState(null);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const openPanel = useCallback(
    (label: string) => setOpenState({ label, path: pathname }),
    [pathname],
  );

  // Esc closes and returns focus to the trigger that opened it.
  useEffect(() => {
    if (!openLabel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        triggerRef.current?.focus();
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      // Trap focus inside the open panel.
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openLabel, close]);

  // Lock scroll while the panel is open so the blurred page can't drift.
  useEffect(() => {
    if (!openLabel) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openLabel]);

  const openItem = PRIMARY_NAV.find((n) => n.label === openLabel);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
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

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
          onMouseLeave={() => {
            closeTimer.current = setTimeout(close, 180);
          }}
          onMouseEnter={() => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
          }}
        >
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
                >
                  {item.label}
                </Link>
              );
            }
            const isOpen = openLabel === item.label;
            return (
              <button
                key={item.href}
                ref={isOpen ? triggerRef : undefined}
                className={`mono rounded-full px-3 py-2 transition-colors hover:text-blue ${
                  active || isOpen ? "text-blue" : "text-content-dim"
                }`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                onMouseEnter={() => openPanel(item.label)}
                onClick={() => (isOpen ? close() : openPanel(item.label))}
              >
                {item.label}
              </button>
            );
          })}
          <Link
            href="/contact"
            className="mono ml-2 rounded-full border border-rule px-4 py-2 transition-colors hover:border-coral hover:text-coral"
            onMouseEnter={close}
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

      <AnimatePresence>
        {openItem?.columns ? (
          <>
            <motion.div
              className="fixed inset-0 -z-10 bg-ink/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={close}
              aria-hidden="true"
            />
            <motion.div
              ref={panelRef}
              className="mx-3 overflow-hidden rounded-2xl border border-rule bg-ink-raised md:mx-8"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
                {openItem.columns.map((col) => (
                  <div key={col.heading}>
                    <p className="mono mb-4 text-content-dim">{col.heading}</p>
                    <ul className="grid gap-1">
                      {col.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="group block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
                          >
                            <span className="text-step-0 transition-colors group-hover:text-blue">
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
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export default Header;
