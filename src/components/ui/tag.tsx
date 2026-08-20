import { cn } from "@/lib/cn";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

/** A tech chip. Wraps before it shrinks — labels are never truncated. */
export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-block border-2 border-rule px-2 py-1",
        "font-mono text-[0.6875rem] leading-none tracking-[0.1em] uppercase",
        "md:text-xs",
        className,
      )}
    >
      {children}
    </span>
  );
}
