/**
 * First tab stop on every page. Visually hidden until focused, then it
 * lands above everything — z-skip is the top of the scale.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:border-4 focus:border-rule focus:bg-accent focus:px-4 focus:py-3 focus:font-mono focus:text-label focus:uppercase focus:text-accent-fg"
    >
      Skip to content
    </a>
  );
}
