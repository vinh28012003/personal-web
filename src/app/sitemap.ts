import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { allRoutes } from "@/lib/routes";

/**
 * Built from the shared route list rather than assembled by hand, so a new
 * page cannot be added without appearing here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return allRoutes().map((entry) => ({
    url: entry.path === "/" ? SITE_URL : `${SITE_URL}${entry.path}`,
    changeFrequency: "monthly" as const,
    // The homepage is the entry point; everything else sits just below it.
    priority: entry.path === "/" ? 1 : 0.8,
    // Only posts carry one. Omitted rather than faked for everything else.
    ...(entry.lastModified && { lastModified: entry.lastModified }),
  }));
}
