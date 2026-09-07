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
 * It takes `children`, NOT `posts`, and that is load-bearing. This is a
 * client component, and a Server Component passed through it as children
 * stays on the server. Change the prop to `posts` and render PostSheet in
 * here, and PostSheet, next/link and PostDate all cross into the client
 * bundle for no behavioural gain -- on the one page whose design goal was to
 * ship almost no JS.
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

    let frame = 0;
    const set = (x: number, y: number) => {
      plane.style.setProperty("--tilt-x", `${x.toFixed(2)}deg`);
      plane.style.setProperty("--tilt-y", `${y.toFixed(2)}deg`);
    };

    /** rAF-coalesced, and the single place data-motion is honoured. */
    const schedule = (derive: (event: Event) => void, event: Event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (document.documentElement.getAttribute("data-motion") === "off") {
          set(0, 0);
          return;
        }
        derive(event);
      });
    };

    /* The two drivers differ ONLY in how they turn geometry into a lean, and
       they write the same two properties. Keeping them as data means one
       subscribe and one teardown instead of a branch that returns its own
       cleanup and leaves the effect with two exit paths. */
    const fromPointer = (event: Event) => {
      const { clientX, clientY } = event as PointerEvent;
      const r = desk.getBoundingClientRect();
      const px = clamp((clientX - (r.left + r.width / 2)) / (r.width / 2));
      const py = clamp((clientY - (r.top + r.height / 2)) / (r.height / 2));
      // Cursor low tips the near edge toward the reader.
      set(-py * MAX_TILT_DEG, px * MAX_TILT_DEG);
    };

    const fromScroll = () => {
      const r = desk.getBoundingClientRect();
      const middle = window.innerHeight / 2;
      const p = clamp((r.top + r.height / 2 - middle) / middle);
      set(-p * MAX_TILT_DEG * SCROLL_TILT_SCALE, 0);
    };

    const rest = () => set(0, 0);

    /* pointermove binds to the DESK, not window. With a window listener the
       pointerleave reset is dead code: leaving fires it, and the next
       pointer movement anywhere on the page re-saturates the tilt, so the
       desk sits pinned at maximum lean while the reader is in the footer.
       Measured before the fix: 4deg/4deg with the cursor far outside. */
    const coarse = !window.matchMedia("(pointer: fine)").matches;
    const bindings: [EventTarget, string, (event: Event) => void][] = coarse
      ? // No pointer to track, but there is always scroll.
        [[window, "scroll", fromScroll]]
      : [
          [desk, "pointermove", fromPointer],
          [desk, "pointerleave", rest],
        ];

    const unbind = bindings.map(([target, type, derive]) => {
      const handler = (event: Event) => schedule(derive, event);
      target.addEventListener(type, handler, { passive: true });
      return () => target.removeEventListener(type, handler);
    });

    /* The desk's resting lean depends on where it already sits in the page,
       so the coarse driver needs one pass before any scroll happens. Through
       schedule(), not called directly: a page loaded with data-motion
       already off -- print, or a non-scrolling capture -- must start flat. */
    if (coarse) schedule(fromScroll, new Event("init"));

    return () => {
      cancelAnimationFrame(frame);
      for (const off of unbind) off();
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
