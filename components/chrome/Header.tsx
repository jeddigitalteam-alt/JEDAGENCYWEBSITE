"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PRIMARY_NAV, SITE } from "@/lib/site";
import PuzzleSiteLogo from "@/components/brand/PuzzleSiteLogo";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Always shown within this distance of the top, whichever way you are going. */
const TOP_ZONE = 64;
/** Ignore movement smaller than this, so trackpad jitter cannot toggle it. */
const TOLERANCE = 10;

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

  /* --- hide going down, reveal coming up -------------------------------
     Compares against the last position that actually moved the header, so a
     run of sub-TOLERANCE deltas accumulates instead of being discarded — that
     is what stops a trackpad twitch flickering it. Reads window.scrollY, which
     Lenis drives, so smooth scrolling is already accounted for. */
  const reduced = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= TOP_ZONE) {
        lastY.current = y;
        setHidden(false);
        return;
      }
      const delta = y - lastY.current;
      if (Math.abs(delta) < TOLERANCE) return;
      lastY.current = y;
      setHidden(delta > 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The palette is the mobile menu, so the header stays put while it is open.
     No initial read is needed: both mount together in the root layout and the
     palette always starts closed, so the only transitions come from the event. */
  useEffect(() => {
    const onState = (e: Event) =>
      setPaletteOpen(Boolean((e as CustomEvent).detail?.open));
    document.addEventListener("puzzle:palette-state", onState);
    return () => document.removeEventListener("puzzle:palette-state", onState);
  }, []);

  // An open mega-menu or palette pins it regardless of scroll direction.
  const pinned = Boolean(openLabel) || paletteOpen;

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={false}
      animate={{ y: hidden && !pinned ? "-100%" : "0%" }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.34, ease: EASE }
      }
    >
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
          <PuzzleSiteLogo
            className="h-7 w-7 text-blue transition-transform duration-500 group-hover:rotate-45"
            style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
          />
          <span className="wordmark text-step-1 lowercase leading-none">
            {SITE.wordmark}
          </span>
        </Link>

        {/* `lg`, not `md`. Splitting Industries out of the Services panel adds a
            sixth top-level item, and six plus the pill measures ~750px of a
            768px screen — it fits by a hair and wraps on any longer label. The
            palette is already the navigation below this breakpoint, so the
            tablet range simply uses it. */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
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
                      {/* Sized from the panel's own content: a single column
                          in a 44rem box would be one narrow list against a
                          field of empty. Both panels carry one column today;
                          the two-column case is kept because the markup is
                          generic and the data decides. */}
                      <div
                        className={`overflow-hidden rounded-2xl border border-rule bg-ink-raised ${
                          item.columns.length > 1
                            ? "w-[min(44rem,calc(100vw-2rem))]"
                            : "w-[min(26rem,calc(100vw-2rem))]"
                        }`}
                      >
                        <div
                          className={`grid gap-8 p-6 md:p-8 ${
                            item.columns.length > 1 ? "md:grid-cols-2" : ""
                          }`}
                        >
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
            /* The header's primary CTA, filled in Puzzle blue like every other
               "Start a project" on the site. It was a bordered pill with a
               coral hover, which read as one more nav item. */
            className="mono ml-2 rounded-full bg-blue px-4 py-2 text-ink transition-colors hover:bg-blue-lift active:scale-[0.98]"
            onMouseEnter={close}
            onFocus={close}
          >
            Start a project
          </Link>
        </nav>

        {/* Mobile and tablet: the palette is the nav. Cheaper than a second
            menu system, and it already carries every route — including both
            services and industries — so the split above needs nothing here. */}
        <button
          className="mono rounded-full border border-rule px-4 py-2 lg:hidden"
          onClick={() =>
            document.dispatchEvent(new CustomEvent("puzzle:open-palette"))
          }
        >
          Menu
        </button>
      </div>
    </motion.header>
  );
}

export default Header;
