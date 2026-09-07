"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The desk. First client component in the blog subtree, and the first thing
 * in this repo that actually honours data-motion in JS.
 *
 * ONE listener drives everything. It writes --tilt-x / --tilt-y on the plane
 * and stops there; the sheets are never touched. Each sheet's own
 * translateZ(--depth) turns that single rotation into parallax through the
 * shared perspective, because an element at higher Z displaces further on
 * screen for the same angle. That is the whole mechanism, and it is what the
 * inherits:true on the tilt pair was registered for.
 *
 * Two drivers, one stylesheet: a fine pointer tracks the cursor, a coarse one
 * tracks scroll position. Both write the same two properties.
 *
 * prefers-reduced-motion is deliberately NOT checked here. The blog is a
 * playground and that call was made explicitly; see the matching note in
 * globals.css, which has to ADD a transition override to make the relaxation
 * work rather than omit one. Do not "fix" this by adding a guard.
 *
 * data-motion="off" IS honoured, because that is a different thing: the
 * test, print and capture escape hatch. The four older guards in this repo
 * (page-enter, reveal, smooth-anchor-scroll, the boot script) all check
 * matchMedia and ignore the attribute; the CSS !important rule masks it for
 * them, which is why nothing ever caught it.
 */
const MAX_TILT_DEG = 4;
/* Scroll is a coarser signal than a cursor -- it moves the whole desk past
   the viewport rather than pointing at a spot on it -- so the coarse-pointer
   driver leans less for the same normalised input. */
const SCROLL_TILT_SCALE = 0.7;

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

export function PostDesk({ children }: { children: ReactNode }) {
  const deskRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const desk = deskRef.current;
    const plane = planeRef.current;
    if (!desk || !plane) return;

    const motionOff = () =>
      document.documentElement.getAttribute("data-motion") === "off";

    let frame = 0;
    const set = (x: number, y: number) => {
      plane.style.setProperty("--tilt-x", `${x.toFixed(2)}deg`);
      plane.style.setProperty("--tilt-y", `${y.toFixed(2)}deg`);
    };
    const schedule = (fn: () => void) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (motionOff()) {
          set(0, 0);
          return;
        }
        fn();
      });
    };

    const fine = window.matchMedia("(pointer: fine)").matches;

    if (fine) {
      const onMove = (e: PointerEvent) =>
        schedule(() => {
          const r = desk.getBoundingClientRect();
          const px = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2));
          const py = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2));
          // Cursor low tips the near edge toward the reader.
          set(-py * MAX_TILT_DEG, px * MAX_TILT_DEG);
        });
      const onLeave = () => schedule(() => set(0, 0));

      /* On the DESK, not on window. With a window listener the pointerleave
         reset below is dead code: leaving fires it, and the next pointermove
         from anywhere on the page immediately re-saturates the tilt, so the
         desk sits pinned at maximum lean while the reader is in the footer.
         Measured before the fix: 4deg/4deg with the cursor far outside. */
      desk.addEventListener("pointermove", onMove, { passive: true });
      desk.addEventListener("pointerleave", onLeave);
      return () => {
        cancelAnimationFrame(frame);
        desk.removeEventListener("pointermove", onMove);
        desk.removeEventListener("pointerleave", onLeave);
      };
    }

    // No pointer to track, but there is always scroll. The desk leans as it
    // passes the middle of the viewport.
    const onScroll = () =>
      schedule(() => {
        const r = desk.getBoundingClientRect();
        const middle = window.innerHeight / 2;
        const p = clamp((r.top + r.height / 2 - middle) / middle);
        set(-p * MAX_TILT_DEG * SCROLL_TILT_SCALE, 0);
      });

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={deskRef} className="post-desk mt-16">
      <ul ref={planeRef} className="post-desk-plane">
        {children}
      </ul>
    </div>
  );
}
