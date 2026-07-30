"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TEAM, type Person } from "@/lib/team";
import { Eyebrow } from "@/components/ui/primitives";

const SPRING = { type: "spring", stiffness: 300, damping: 26, mass: 0.8 } as const;
/** Within this distance of home, a released card seats itself. */
const SNAP = 64;

/**
 * The team grid is a puzzle board. Cards are draggable, seat back into their
 * notch when released near home, and the reassemble button springs them all
 * back.
 *
 * Position is held in motion values rather than React state: passing an
 * `animate={{ x, y }}` prop alongside `drag` makes the animation prop fight the
 * gesture and the drag never commits. Motion values let the gesture own the
 * transform and let us animate it deliberately when we want to.
 *
 * Reduced-motion users get a plain static grid — drag is disabled rather than
 * merely un-animated, because a card that teleports on drag is worse than one
 * that doesn't move.
 */
export function TeamBoard() {
  const reduced = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const [looseNames, setLooseNames] = useState<string[]>([]);
  const [resetToken, setResetToken] = useState(0);

  const setLoose = (name: string, loose: boolean) =>
    setLooseNames((names) =>
      loose
        ? names.includes(name)
          ? names
          : [...names, name]
        : names.filter((n) => n !== name),
    );

  const reassemble = () => {
    setResetToken((t) => t + 1);
    setLooseNames([]);
  };

  const seated = TEAM.length - looseNames.length;

  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>The studio — {TEAM.length} people</Eyebrow>
          <h2 className="display mt-4 max-w-[18ch] text-step-4">
            Small on purpose, <em>senior throughout</em>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="mono tabular-nums text-content-dim">
            {reduced
              ? `${TEAM.length} seated`
              : `${seated} / ${TEAM.length} seated`}
          </span>
          <button
            onClick={reassemble}
            disabled={reduced || looseNames.length === 0}
            className="mono rounded-full border border-rule px-5 py-2.5 transition-colors enabled:hover:border-blue enabled:hover:text-blue disabled:opacity-40"
          >
            Reassemble
          </button>
        </div>
      </div>

      {!reduced ? (
        <p className="mono mt-6 text-content-dim">Drag a card out of place.</p>
      ) : null}

      <div
        ref={boardRef}
        className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {TEAM.map((person) => (
          <TeamCard
            key={person.name}
            person={person}
            boardRef={boardRef}
            reduced={Boolean(reduced)}
            resetToken={resetToken}
            onLooseChange={(loose) => setLoose(person.name, loose)}
          />
        ))}
      </div>
    </section>
  );
}

function TeamCard({
  person,
  boardRef,
  reduced,
  resetToken,
  onLooseChange,
}: {
  person: Person;
  boardRef: React.RefObject<HTMLDivElement | null>;
  reduced: boolean;
  resetToken: number;
  onLooseChange: (loose: boolean) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [loose, setLoose] = useState(false);

  // Spring everything home when the reassemble button is pressed.
  useEffect(() => {
    if (resetToken === 0) return;
    animate(x, 0, SPRING);
    animate(y, 0, SPRING);
    setLoose(false);
  }, [resetToken, x, y]);

  return (
    <motion.article
      drag={!reduced}
      dragConstraints={boardRef}
      dragElastic={0.14}
      dragMomentum={false}
      style={{ x, y, touchAction: reduced ? undefined : "none" }}
      whileDrag={{ scale: 1.04, zIndex: 30 }}
      onDragEnd={() => {
        const home = Math.hypot(x.get(), y.get()) < SNAP;
        if (home) {
          animate(x, 0, SPRING);
          animate(y, 0, SPRING);
        }
        setLoose(!home);
        onLooseChange(!home);
      }}
      className={`relative rounded-xl border bg-ink-raised p-5 ${
        loose ? "border-coral/60" : "border-rule"
      } ${reduced ? "" : "cursor-grab active:cursor-grabbing"}`}
    >
      {/* the notch that seats this card against its neighbour */}
      <span
        aria-hidden="true"
        className="absolute -right-1.5 top-1/2 h-6 w-3 -translate-y-1/2 rounded-r-full border-y border-r border-rule bg-ink-raised"
      />
      <h3 className="display text-step-1">{person.name}</h3>
      <p className="mono mt-1 text-blue">{person.role}</p>
      <p className="mt-4 text-step--1 text-content-dim">{person.note}</p>
    </motion.article>
  );
}

export default TeamBoard;
