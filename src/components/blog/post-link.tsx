import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Every link in a post body.
 *
 * Two contracts a post author should not have to remember:
 *
 * 1. Colour is --accent-text, never --accent. globals.css labels --accent
 *    "bg/border/display >=24px ONLY" at 3.42:1 on the portfolio; a body-copy
 *    link in text-accent is a contrast failure. Inside .blog both names
 *    resolve to the same 8.46:1 blue, but using the right one here means the
 *    rule survives if the blog palette ever changes.
 * 2. External links announce themselves. Same pattern as the Links slab on
 *    the project pages: target, rel, and an sr-only suffix.
 */
export function PostLink({
  href = "",
  children,
  ...rest
}: ComponentPropsWithoutRef<"a">) {
  const className =
    "text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2";

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        {...rest}
      >
        {children}
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
