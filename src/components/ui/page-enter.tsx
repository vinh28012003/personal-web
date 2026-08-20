"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Enter-only route transition.
 *
 * The skill's route-change preset animates the OUT state and calls
 * `navigate()` from `onComplete`. We deliberately don't: the design rule is
 * that correctness never depends on an animation-end event, and the preset's
 * own note says "don't block navigation on animation". Animating only the
 * incoming page gets the same perceived polish with none of that coupling —
 * if GSAP never runs, the user still navigates instantly.
 *
 * Timing follows the Subtle tier: 200-300ms, power1.inOut, and the entrance
 * is the slower half of the asymmetry (there is no exit to be slower than).
 */
export function PageEnter({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Clear the guard first, unconditionally. If anything below throws or is
    // skipped, the content is already visible rather than stranded at 0.
    el.setAttribute("data-page-enter", "in");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.24,
        ease: "power1.inOut",
        overwrite: "auto",
        // Strip the inline transform when finished. GSAP otherwise leaves
        // `transform: translate(0px, 0px)` behind, and a non-none transform
        // creates a containing block — which silently changes how any
        // position: sticky / fixed descendant resolves.
        clearProps: "transform,willChange",
      },
    );

    return () => {
      tween.kill();
      gsap.set(el, { opacity: 1 });
      gsap.set(el, { clearProps: "transform,willChange" });
    };
  }, [pathname]);

  return (
    <div ref={ref} data-page-enter="pending">
      {children}
    </div>
  );
}
