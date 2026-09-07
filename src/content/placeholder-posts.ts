import type { Post } from "./types";

/**
 * Fake posts, for looking at the scene with more beats than exist.
 *
 * The blog's whole premise is that every claim on it is checkable, so a
 * fabricated post that reads as real is the single worst thing this repo
 * could ship. Three things make that hard rather than merely unlikely:
 *
 *   1. OFF unless PLACEHOLDER_POSTS is set. No flag, no placeholders.
 *   2. They never enter posts[] or publishedPosts(), so they cannot reach
 *      allRoutes(), the sitemap, generateStaticParams, an OG image or a post
 *      page. They exist only as extra cards on the index.
 *   3. Every one says PLACEHOLDER in its title, and the card renders a badge.
 *      placeholder-posts.test.ts asserts all of it.
 *
 * Usage:
 *   PLACEHOLDER_POSTS=6 pnpm dev
 *   PLACEHOLDER_POSTS=6 pnpm build && pnpm start -p 3210
 *
 * Read at build time in a Server Component, so nothing ships to the client.
 */
const MAX = 24;

/** Fixed, not derived from today: a build must be reproducible. */
const ANCHOR = "2026-08-01";

function isoMinusDays(days: number): string {
  const d = new Date(`${ANCHOR}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Count comes from the environment and is clamped. A non-numeric or absent
 * value yields none -- the safe direction, and the default.
 */
export function placeholderCount(): number {
  const raw = Number.parseInt(process.env.PLACEHOLDER_POSTS ?? "", 10);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(raw, MAX);
}

export function placeholderPosts(): readonly Post[] {
  return Array.from({ length: placeholderCount() }, (_, i) => ({
    slug: `placeholder-${i + 1}`,
    // No dashes of any kind: seo.spec.ts bans em and en dashes anywhere a
    // visitor can see, and a placeholder is still visible.
    title: `PLACEHOLDER post ${i + 1}`,
    published: isoMinusDays(i * 9),
    excerpt:
      "Placeholder copy, here only to give the scene another beat to travel through. It is not a real post and does not resolve to one.",
    tags: [] as const,
  }));
}
