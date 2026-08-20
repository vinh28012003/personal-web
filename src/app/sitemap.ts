import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

const BASE = "https://vinh-tran.vercel.app";

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
