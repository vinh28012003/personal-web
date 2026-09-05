import type { ReactNode } from "react";
import { PageEnter } from "@/components/ui/page-enter";
import { SkipLink } from "@/components/layout/skip-link";
import { SmoothAnchorScroll } from "@/components/layout/smooth-anchor-scroll";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

/**
 * The portfolio's chrome, in one place, called from two.
 *
 * It has to be a component rather than just living in (portfolio)/layout.tsx
 * because app/not-found.tsx does NOT render inside that layout. Next nests a
 * layout around the not-found.js of its OWN segment only, and unmatched URLs
 * are handled by the root app/not-found.tsx -- which sits above the route
 * group. Put the chrome solely in the group layout and /work/nope renders
 * with no header, no footer and no skip link.
 *
 * That is not hypothetical. The comment this replaces recorded the same
 * drift happening once already, when the chrome was repeated per page and
 * not-found.tsx silently lost its SkipLink. interactive.spec.ts asserts
 * "every page has a skip link, including 404" because of it.
 *
 * The header must stay OUTSIDE PageEnter: PageEnter carries a transform for
 * the duration of its tween, which becomes the containing block for any
 * position: sticky descendant, and dragged the header ~10px off the top on
 * every route change.
 */
export function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SmoothAnchorScroll />
      <SkipLink />
      <SiteHeader />
      <PageEnter className="flex-1">{children}</PageEnter>
      <SiteFooter />
    </>
  );
}
