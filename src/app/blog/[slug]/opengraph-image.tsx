import { ImageResponse } from "next/og";
import { publishedPosts, getPost } from "@/content/posts";

export const alt = "Blog post by Vinh Tran";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return publishedPosts().map((p) => ({ slug: p.slug }));
}

/**
 * The blog's OG card. Mirrors the project one in structure, but paints the
 * blog palette rather than the portfolio's, so a shared link looks like the
 * page it opens.
 *
 * Colours are literal because ImageResponse renders outside the document and
 * cannot read CSS custom properties. They must be kept in step with the
 * --blog-* primitives in globals.css by hand; there is no token to import.
 */
export default async function PostOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdfcf9",
          color: "#1c1b19",
          borderTop: "16px solid #2f4b7c",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 4,
            fontWeight: 700,
            color: "#5f5c56",
          }}
        >
          VINH TRAN · BLOG
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {post?.title ?? "Blog"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              color: "#5f5c56",
              maxWidth: 940,
            }}
          >
            {post?.excerpt ?? ""}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 2,
            color: "#5f5c56",
          }}
        >
          {post?.published ?? ""}
        </div>
      </div>
    ),
    size,
  );
}
