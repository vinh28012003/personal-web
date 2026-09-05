import { cn } from "@/lib/cn";

/**
 * First tab stop on every page. Visually hidden until focused, then it
 * lands above everything — z-skip is the top of the scale.
 *
 * `className` overrides the visible-on-focus styling only. The blog passes
 * its own because the default hardcodes `border-4`, which reads as brutalist
 * inside a hairline design. The href and the sr-only behaviour are not
 * overridable: every page owes a first tab stop that reaches #main, and that
 * is asserted in interactive.spec.ts.
 */
export function SkipLink({ className }: { className?: string }) {
  return (
    <a
      href="#main"
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:border-4 focus:border-rule focus:bg-accent focus:px-4 focus:py-3 focus:font-mono focus:text-label focus:uppercase focus:text-accent-fg",
        className,
      )}
    >
      Skip to content
    </a>
  );
}
