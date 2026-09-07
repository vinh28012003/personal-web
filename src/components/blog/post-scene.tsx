"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The scene: a tall track with a sticky viewport-height stage inside it.
 * Scrolling the track moves the reader through the narrative while the stage
 * holds still.
 *
 * Sticky, not GSAP ScrollTrigger. ScrollTrigger's pin wraps its target in a
 * pin-spacer and applies position:fixed plus a transform, which would break
 * the .blog flatten invariant blog.spec.ts asserts, and would pull gsap into
 * a bundle blog/layout.tsx deliberately keeps it out of.
 *
 * It takes `children`, NOT `posts`, and that is load-bearing. This is a
 * client component, and a Server Component passed through as children stays
 * on the server. Render PostCard in here instead and PostCard, next/link and
 * PostDate all cross into the client bundle. `count` is a number, so passing
 * it costs nothing.
 *
 * The listener writes ONE property and one attribute. --scene-progress is a
 * registered <number> so calc() can do arithmetic on it, and it inherits, so
 * every card and every environment layer derives its own state from that
 * single write with no per-card JavaScript.
 *
 * data-motion="off" is honoured here and in CSS. The CSS arm removes the
 * track outright, which is the finished state of a narrative: its
 * destination, the quiet index below.
 */
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function PostScene({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const list = listRef.current;
    if (!track || !stage || !list) return;

    let frame = 0;
    let front = -1;

    const apply = () => {
      const rect = track.getBoundingClientRect();
      // The track is one screen taller than the stage, so the travel
      // distance is its height minus one viewport. Guard the divide: the
      // CSS arm can set display:none, which makes every measurement 0.
      const travel = rect.height - window.innerHeight;
      const progress = travel <= 0 ? 0 : clamp01(-rect.top / travel);
      stage.style.setProperty("--scene-progress", progress.toFixed(4));

      /* Which card is the subject. Solving --u = 0 for i gives
         i = progress * count - 0.5, the same expression the CSS uses, so the
         attribute and the transform can never disagree about which card is
         at the front. Written only when it CHANGES -- this is one attribute
         per beat, not per frame. */
      const next = Math.min(
        count - 1,
        Math.max(0, Math.round(progress * count - 0.5)),
      );
      if (next !== front) {
        front = next;
        const cards = list.children;
        for (let i = 0; i < cards.length; i++) {
          if (i === next) cards[i].setAttribute("data-front", "");
          else cards[i].removeAttribute("data-front");
        }
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (document.documentElement.getAttribute("data-motion") === "off") {
          stage.style.setProperty("--scene-progress", "0");
          return;
        }
        apply();
      });
    };

    // The resting state depends on where the track already sits, so one pass
    // before any event. Through schedule(), so a page loaded with the escape
    // hatch already set never leans.
    schedule();

    const bindings: [EventTarget, string][] = [
      [window, "scroll"],
      [window, "resize"],
    ];
    for (const [target, type] of bindings) {
      target.addEventListener(type, schedule, { passive: true });
    }
    return () => {
      cancelAnimationFrame(frame);
      for (const [target, type] of bindings) {
        target.removeEventListener(type, schedule);
      }
    };
  }, [count]);

  return (
    <section
      ref={trackRef}
      className="scene-track"
      aria-label="Posts"
      // --span is the card count. The geometry is a function of how many
      // posts exist, never a hand-kept number: publishing one lengthens the
      // journey by exactly one beat with no code touched.
      style={{ "--span": count } as React.CSSProperties}
    >
      <div ref={stageRef} className="scene">
        <div className="scene-env" aria-hidden="true">
          <div className="scene-layer scene-layer--far" />
          <div className="scene-layer scene-layer--mid" />
          <div className="scene-layer scene-layer--near" />
          <div className="scene-veil" />
        </div>
        <ul ref={listRef} className="scene-cards">
          {children}
        </ul>
      </div>
    </section>
  );
}
