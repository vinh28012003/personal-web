import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SlabProps extends ComponentPropsWithoutRef<"div"> {
  as?: ElementType;
  /** 4px is the default structural border; 2px is for nested/inline boxes. */
  border?: 2 | 4 | 0;
  /** Exactly three elevations exist. Anything else is a bug. */
  shadow?: "none" | "slab" | "lg";
  /** Flips to the inverse ground — used for the contact block. */
  inverted?: boolean;
  /** Paints the card surface rather than sitting directly on the page. */
  surface?: boolean;
  children?: ReactNode;
}

/**
 * The one bordered-box primitive. Every visible border in the app comes from
 * here, which is what keeps "brutalist" from drifting into "broken" — the
 * borders are always exactly 2px or 4px, never 1px, never arbitrary.
 */
export function Slab({
  as: Tag = "div",
  border = 4,
  shadow = "none",
  inverted = false,
  surface = false,
  className,
  children,
  ...props
}: SlabProps) {
  return (
    <Tag
      className={cn(
        border === 4 && "border-4",
        border === 2 && "border-2",
        border === 0 && "border-0",
        "border-rule",
        surface && !inverted && "bg-surface",
        inverted && "inverted",
        shadow === "slab" && "shadow-slab",
        shadow === "lg" && "shadow-slab-lg",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
