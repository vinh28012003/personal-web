import { cn } from "@/lib/cn";
import { Rule } from "./rule";

interface SectionHeaderProps {
  /** Two-digit ordinal, e.g. "01". Part of the spec-sheet language. */
  index: string;
  title: string;
  /** Scroll anchor target. */
  id: string;
  className?: string;
}

export function SectionHeader({
  index,
  title,
  id,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-8 md:mb-12", className)}>
      <Rule weight={4} />
      <h2
        id={id}
        // scroll-mt clears the sticky header so the heading is never
        // hidden behind it when linked to directly.
        className="mt-4 scroll-mt-28 text-h2 uppercase"
      >
        <span
          aria-hidden="true"
          className="mr-4 font-mono text-label align-middle text-muted"
        >
          {index}
        </span>
        {title}
      </h2>
    </div>
  );
}
