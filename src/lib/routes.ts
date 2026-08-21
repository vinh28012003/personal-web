import { projects } from "@/content/projects";

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
export const STATIC_ROUTES = ["/", "/resume"] as const;

/** Static routes plus one entry per generated project page. */
export function allRoutes(): string[] {
  return [...STATIC_ROUTES, ...projects.map((p) => `/work/${p.slug}`)];
}
