import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Supplied implementation, unchanged in structure and API.
 *
 * The track is rendered twice and shifted by exactly -50%, which is the same
 * trick the clients rail, the services panels and the process timeline all use
 * — so it reuses their `@keyframes marquee` rather than adding a second copy.
 * `animate-marquee`, `animate-marquee-reverse` and the reduced-motion stop live
 * in `app/globals.css` next to those keyframes.
 *
 * Not a client component: there is no state, no effect and no handler here. The
 * pause-on-hover is a CSS variant and the duration is a custom property, so this
 * renders on the server like the rest of the service page.
 */
interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  /** Seconds for one full pass. Read by the CSS as `--duration`. */
  speed?: number;
}

export function Marquee({
  children,
  pauseOnHover = false,
  direction = "left",
  speed = 30,
  className,
  ...props
}: MarqueeProps) {
  return (
    <div
      className={cn("w-full overflow-hidden sm:mt-24 mt-10 z-10", className)}
      {...props}
    >
      <div className="relative flex max-w-[90vw] overflow-hidden py-5">
        <div
          className={cn(
            "flex w-max animate-marquee",
            pauseOnHover && "hover:[animation-play-state:paused]",
            direction === "right" && "animate-marquee-reverse",
          )}
          style={{ "--duration": `${speed}s` } as React.CSSProperties}
        >
          {children}
          {children}
        </div>
      </div>
    </div>
  );
}

export default Marquee;
