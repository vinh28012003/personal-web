import { cn } from "@/lib/cn";

interface RuleProps {
  weight?: 2 | 4;
  className?: string;
}

/** A horizontal rule. Presentational only — never announced to screen readers. */
export function Rule({ weight = 4, className }: RuleProps) {
  return (
    <hr
      role="presentation"
      className={cn(
        "w-full border-0 bg-rule",
        weight === 4 ? "h-1" : "h-0.5",
        className,
      )}
    />
  );
}
