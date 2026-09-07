"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The arc: a tall track with a sticky, viewport-height stage inside it.
 * Scrolling the track turns a curved wall of glass panels past the reader.
 *
 * Sticky, not GSAP ScrollTrigger. ScrollTrigger's pin wraps its target in a
 * pin-spacer and applies position:fixed plus a transform, which would break
 * the .blog flatten invariant blog.spec.ts asserts and pull gsap into a
 * bundle blog/layout.tsx deliberately keeps empty.
 *
 * It takes `children`, NOT the panel data, and that is load-bearing. This is
 * a client component, and a Server Component passed through as children
 * stays on the server. Render the panels in here and next/link and the whole
 * panel tree cross into the client bundle. `count` and `labels` are plain
 * data, so passing them costs nothing.
 *
 * The listener writes ONE property and one attribute. --scene-progress is a
 * registered <number> so calc() can do arithmetic on it, and it inherits, so
 * the rail, the floor and every panel derive their state from that single
 * write with no per-panel JavaScript.
 */
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function PostScene({
  count,
  labels,
  children,
}: {
  count: number;
  /** Panel titles, for the heads-up readout. Plain strings, not components. */
  labels: string[];
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const readoutRef = useRef<HTMLParagraphElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const rail = railRef.current;
    if (!track || !stage || !rail) return;

    let frame = 0;
    let front = -1;

    const apply = () => {
      const rect = track.getBoundingClientRect();
      // The track is one screen taller than the stage, so travel is its
      // height minus one viewport. Guard the divide: the CSS arm can set
      // display:none, which makes every measurement 0.
      const travel = rect.height - window.innerHeight;
      const progress = travel <= 0 ? 0 : clamp01(-rect.top / travel);
      stage.style.setProperty("--scene-progress", progress.toFixed(4));

      /* The chrome has to know what is behind it. The header is a sibling of
         <main> and deliberately outside the scene, so no descendant selector
         can reach it -- this attribute is the only channel. "Engaged" means
         the track is actually filling the viewport, not merely on the page. */
      const engaged = rect.top <= 1 && rect.bottom > window.innerHeight - 1;
      if (engaged) document.documentElement.setAttribute("data-scene", "on");
      else document.documentElement.removeAttribute("data-scene");

      /* Which panel is facing the reader. The rail turns by
         progress * (count - 1) * step, and panel i sits at i * step, so the
         panel at the front is round(progress * (count - 1)) -- the same
         expression the CSS rotation uses, which is why the attribute and the
         geometry can never disagree. Written only when it CHANGES. */
      const next = Math.min(
        count - 1,
        Math.max(0, Math.round(progress * (count - 1))),
      );
      if (next !== front) {
        front = next;
        const panels = rail.children;
        for (let i = 0; i < panels.length; i++) {
          if (i === next) panels[i].setAttribute("data-front", "");
          else panels[i].removeAttribute("data-front");
        }
        if (readoutRef.current) {
          readoutRef.current.textContent = `${String(next + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
        }
        if (labelRef.current) {
          labelRef.current.textContent = labels[next] ?? "";
        }
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (document.documentElement.getAttribute("data-motion") === "off") {
          stage.style.setProperty("--scene-progress", "0");
          document.documentElement.removeAttribute("data-scene");
          return;
        }
        apply();
      });
    };

    // The resting state depends on where the track already sits, so one pass
    // before any event. Through schedule(), so a page loaded with the escape
    // hatch already set never turns.
    schedule();

    const events = ["scroll", "resize"] as const;
    for (const type of events) {
      window.addEventListener(type, schedule, { passive: true });
    }
    return () => {
      cancelAnimationFrame(frame);
      for (const type of events) window.removeEventListener(type, schedule);
      // Leaving the page must not strand the chrome in its dark state.
      document.documentElement.removeAttribute("data-scene");
    };
  }, [count, labels]);

  return (
    <section
      ref={trackRef}
      className="scene-track"
      aria-label="Posts"
      // --count drives the track height, the sweep and the step. The geometry
      // is a function of how many panels exist, never a hand-kept number.
      style={{ "--count": count } as React.CSSProperties}
    >
      <div ref={stageRef} className="scene">
        <div className="scene-env" aria-hidden="true">
          <div className="scene-glow" />
          <div className="scene-floor" />
        </div>

        <ul ref={railRef} className="arc-rail">
          {children}
        </ul>

        {/* The glasses, not the world: fixed to the viewport, aria-hidden
            because every word of it is stated properly in the panels and in
            the index below. */}
        <div className="scene-hud" aria-hidden="true">
          <div className="absolute inset-5 border border-current opacity-15 md:inset-8" />
          <p
            ref={readoutRef}
            className="absolute top-8 left-8 font-sans text-post-meta uppercase md:top-11 md:left-11"
          >
            01 / {String(count).padStart(2, "0")}
          </p>
          <p
            ref={labelRef}
            className="absolute top-8 right-8 max-w-[46vw] truncate text-right font-sans text-post-meta uppercase md:top-11 md:right-11"
          >
            {labels[0] ?? ""}
          </p>
        </div>
      </div>
    </section>
  );
}
