/**
 * The canonical origin for this site.
 *
 * Resolved rather than hardcoded, because the same value feeds metadataBase,
 * Open Graph URLs, the sitemap, robots.txt and the JSON-LD graph. Hardcoding
 * it meant a domain that did not exist would silently propagate into all five
 * — broken link previews and a sitemap search engines cannot follow.
 *
 * Order matters:
 *   1. NEXT_PUBLIC_SITE_URL   — set this once when a custom domain is added
 *   2. VERCEL_PROJECT_PRODUCTION_URL — the stable production domain Vercel
 *      injects (host only, no protocol). Note this is the *production* URL
 *      even on preview builds, which is what canonical tags should point at.
 *   3. localhost                — local dev
 *
 * A public origin is not a secret, so NEXT_PUBLIC_ is safe here.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
