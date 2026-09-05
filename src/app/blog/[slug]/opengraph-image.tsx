import { ImageResponse } from "next/og";
import { publishedPosts, getPost } from "@/content/posts";
import { BLOG_OG } from "@/lib/og-palette";
import { formatPostDate } from "@/lib/dates";

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
 * Colours come from lib/og-palette.ts. They are still literal hex -- an
 * ImageResponse renders outside the document and cannot read a custom
 * property -- but they are named after the --blog-* variables they mirror,
 * and og-palette.test.ts reads globals.css and fails if the two drift.
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
          background: BLOG_OG.paper,
          color: BLOG_OG.ink,
          borderTop: `16px solid ${BLOG_OG.accent}`,
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 4,
            fontWeight: 700,
            color: BLOG_OG.muted,
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
              color: BLOG_OG.muted,
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
            color: BLOG_OG.muted,
          }}
        >
          {/* The same formatter the index and the post header use. This
              printed the raw ISO string until the helper existed, so a shared
              link showed "2026-09-04" where the page it opened said
              "September 4, 2026". */}
          {post ? formatPostDate(post.published) : ""}
        </div>
      </div>
    ),
    size,
  );
}
