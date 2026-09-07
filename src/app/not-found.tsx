import { Button } from "@/components/ui/button";
import { PortfolioShell } from "@/components/layout/portfolio-shell";

/**
 * Wraps itself in the chrome rather than inheriting it.
 *
 * This file handles every unmatched URL for the whole app, and it sits ABOVE
 * the (portfolio) route group -- Next nests a layout around the not-found of
 * its own segment only. Without the explicit shell, a 404 renders with no
 * header, no footer and no skip link, which is exactly the drift
 * interactive.spec.ts guards against.
 */
export default function NotFound() {
  return (
    <PortfolioShell>
      <main id="main" className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-label uppercase text-muted">Error 404</p>
          <h1
            className="mt-6 text-hero uppercase"
            style={{ fontVariationSettings: '"wght" 900, "wdth" 125' }}
          >
            <span className="block">Not</span>
            <span className="block">Found</span>
          </h1>
          <p className="mt-8 max-w-[46ch] text-lead">
            That page does not exist. It may have been renamed, or it may never
            have existed in the first place.
          </p>
          <div className="mt-10">
            <Button href="/" variant="primary" size="lg">
              Back to the start
            </Button>
          </div>
        </div>
      </main>
    </PortfolioShell>
  );
}
