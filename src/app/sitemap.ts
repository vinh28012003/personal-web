import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL as BASE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({
      url: `${BASE}/work/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
