import type { Metadata } from "next";
import { publishedPosts } from "@/content/posts";
import { PostDesk } from "@/components/blog/post-desk";
import { PostSheet } from "@/components/blog/post-sheet";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on how I work: agent workflows, system design, data structures, and what I am building toward.",
  alternates: { canonical: "/blog" },
};

/**
 * The index, as a desk with sheets of paper laid on it.
 *
 * Still a Server Component. All the geometry is computed here and handed
 * down as custom properties; the only client code is PostDesk's single
 * listener. Sheets stay real <a> elements, so the page is as crawlable under
 * CSS 3D as it was as a list.
 *
 * No <main> here -- app/blog/layout.tsx owns the landmark.
 */
export default function BlogIndex() {
  const posts = publishedPosts();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-post-title">Blog</h1>
      <p className="mt-5 max-w-[52ch] text-post-lede text-muted">
        Notes on how I work. Agent workflows, system design, data structures,
        and what I am building toward.
      </p>

      <PostDesk>
        {posts.map((p, i) => (
          <PostSheet key={p.slug} post={p} index={i} />
        ))}
      </PostDesk>
    </div>
  );
}
