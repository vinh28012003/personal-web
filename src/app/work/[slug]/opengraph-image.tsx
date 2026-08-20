import { ImageResponse } from "next/og";
import { projects, getProject } from "@/content/projects";

export const alt = "Project write-up by Vinh Tran";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf7",
          color: "#0a0a0a",
          border: "16px solid #0a0a0a",
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, fontWeight: 700, color: "#5e5e58" }}>
          VINH TRAN — WRITE-UP
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 0.9, letterSpacing: -3, textTransform: "uppercase" }}>
            {project?.name ?? "Project"}
          </div>
          <div style={{ display: "flex", fontSize: 30, lineHeight: 1.3, color: "#0a0a0a", maxWidth: 940 }}>
            {project?.tagline ?? ""}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {(project?.headlineMetrics ?? []).map((m) => (
            <div
              key={m.unit}
              style={{
                display: "flex",
                border: "4px solid #0a0a0a",
                padding: "10px 18px",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {m.from && m.to ? `${m.from} → ${m.to}` : `${m.value}${m.suffix ?? ""}`}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
