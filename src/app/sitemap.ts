import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { allRoutes } from "@/lib/routes";

/**
 * Built from the shared route list rather than assembled by hand, so a new
 * page cannot be added without appearing here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return allRoutes().map((route) => ({
    url: route === "/" ? SITE_URL : `${SITE_URL}${route}`,
    changeFrequency: "monthly" as const,
    // The homepage is the entry point; everything else sits just below it.
    priority: route === "/" ? 1 : 0.8,
  }));
}
