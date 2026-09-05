import { projects } from "@/content/projects";
import { publishedPosts } from "@/content/posts";

/**
 * Every indexable route on the site, in one place.
 *
 * The sitemap was previously assembled inline from "home plus the projects",
 * so /resume — added later — silently never appeared in it. Nothing failed;
 * the list was just quietly wrong. Keeping the routes here means the sitemap
 * and the tests that guard it read from the same source.
 *
 * Add a page, add it here. The sitemap test fails if you don't.
 */
export const STATIC_ROUTES = ["/", "/resume", "/blog"] as const;

export interface RouteEntry {
  path: string;
  /**
   * ISO date. Posts are the only content on this site with a real revision
   * date, which is why the sitemap has never emitted lastModified before.
   */
  lastModified?: string;
}

/** Static routes, plus one entry per generated project and post page. */
export function allRoutes(): RouteEntry[] {
  return [
    ...STATIC_ROUTES.map((path) => ({ path })),
    ...projects.map((p) => ({ path: `/work/${p.slug}` })),
    // Drafts are absent from publishedPosts, so a draft can never be listed
    // in a sitemap that the e2e test then asserts resolves 200.
    ...publishedPosts().map((p) => ({
      path: `/blog/${p.slug}`,
      lastModified: p.updated ?? p.published,
    })),
  ];
}
