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
 *
 * href stays optional in the TYPE because MDXComponents types `a` from
 * JSX.IntrinsicElements, where it is optional, and a component demanding it
 * cannot be assigned there. The requirement is therefore enforced at runtime
 * rather than papered over with a default: it used to default to "", so a post
 * written with `[text]()` silently rendered a link to the current page. That
 * is an authoring mistake with no symptom, which is the worst kind. Posts
 * compile at build time, so throwing fails `pnpm build` with the offending
 * link text instead of shipping a link that goes nowhere.
 */
type PostLinkProps = ComponentPropsWithoutRef<"a">;

export function PostLink({ href, children, ...rest }: PostLinkProps) {
  if (!href) {
    throw new Error(
      `PostLink: a post link has no href (link text: ${JSON.stringify(children)}). ` +
        `Markdown "[text]()" produces this. Give the link a destination.`,
    );
  }

  const className =
    "text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2";

  /*
   * Internal is the CLOSED set, and that direction matters.
   *
   * The obvious test is `href.startsWith("http")` -- external. It is wrong by
   * omission rather than by logic: mailto:, tel: and protocol-relative
   * //host.com are all external and none of them start with "http", so all
   * three fell through to next/link, which prefetches them and treats them as
   * routes. Enumerating external protocols means the bug returns with the next
   * protocol nobody listed.
   *
   * There are exactly two shapes next/link can handle -- a path and a
   * fragment. Testing for those and treating the remainder as external makes
   * the whole class correct at once, including protocols that do not exist
   * yet.
   */
  const internal = href.startsWith("/") || href.startsWith("#");

  if (internal) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className} {...rest}>
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}
