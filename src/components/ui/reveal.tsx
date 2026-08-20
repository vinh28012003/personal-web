"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/** One observer for the whole page, not one per element. */
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (typeof window === "undefined") return null;
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-reveal", "in");
        // Reveal once. Nothing re-hides on scroll-up.
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
  );

  return observer;
}

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Stagger position. Capped at 6 so late items never wait a long time. */
  delayIndex?: number;
  className?: string;
}

/**
 * Entrance choreography only — never interaction. Children are passed in as
 * a prop from a Server Component, so they stay server-rendered; this wrapper
 * is the only thing that ships to the client.
 *
 * Correctness never depends on the animation: the element renders its final
 * content unconditionally, the CSS that hides it is scoped to
 * `html:not(.no-js)`, and reduced-motion skips creating the observer at all.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delayIndex = 0,
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced motion: mark it done and never observe anything.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.setAttribute("data-reveal", "in");
      return;
    }

    const io = getObserver();
    if (!io) return;

    io.observe(node);
    return () => io.unobserve(node);
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal="pending"
      style={{ "--reveal-delay": `${Math.min(delayIndex, 6) * 40}ms` } as React.CSSProperties}
      className={className}
    >
      {children}
    </Tag>
  );
}
