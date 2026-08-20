import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-label uppercase text-muted">Error 404</p>
          <h1 className="mt-6 text-hero uppercase" style={{ fontVariationSettings: '"wght" 900, "wdth" 125' }}>
            <span className="block">Not</span>
            <span className="block">Found</span>
          </h1>
          <p className="mt-8 max-w-[46ch] text-lead">
            That page does not exist. It may have been renamed, or it may never
            have existed in the first place.
          </p>
          <div className="mt-10">
            <Button href="/" variant="primary" size="lg">Back to the start</Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
