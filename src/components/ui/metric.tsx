import { cn } from "@/lib/cn";
import type { Metric as MetricData } from "@/content/types";

interface MetricProps {
  metric: MetricData;
  size?: "sm" | "lg";
  className?: string;
}

/**
 * The arrow is an inline SVG, not a "→" glyph — the glyph renders
 * inconsistently across the fallback font stack during the swap window.
 */
function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      aria-hidden="true"
      className="mx-1 inline-block shrink-0 align-middle"
    >
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

/**
 * Renders either a standalone figure ("375K OPS/SEC") or a delta
 * ("500ms -> 80ms"). Either way a screen reader gets the full sentence
 * from `plain` and never has to parse the visual arrangement.
 */
export function Metric({ metric, size = "lg", className }: MetricProps) {
  const isDelta = Boolean(metric.from && metric.to);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="sr-only">{metric.plain}</span>

      <span
        aria-hidden="true"
        className={cn(
          "font-mono font-bold text-on-ground",
          size === "lg" ? "text-metric" : "text-xl md:text-2xl",
        )}
      >
        {isDelta ? (
          <span className="inline-flex items-center whitespace-nowrap">
            <s className="text-muted no-underline line-through decoration-2">{metric.from}</s>
            <Arrow />
            <span>{metric.to}</span>
          </span>
        ) : (
          <>
            {metric.value}
            {metric.suffix && (
              <span className="text-[0.55em] font-normal align-baseline">{metric.suffix}</span>
            )}
          </>
        )}
      </span>

      <span
        aria-hidden="true"
        className="font-mono text-[0.6875rem] leading-tight tracking-[0.1em] uppercase text-muted"
      >
        {metric.unit}
      </span>
    </div>
  );
}
