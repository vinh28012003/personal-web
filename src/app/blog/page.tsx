import type { Metadata } from "next";
import { publishedPosts } from "@/content/posts";
import { placeholderPosts } from "@/content/placeholder-posts";
import { scenePanels } from "@/content/scene-panels";
import { PostScene } from "@/components/blog/post-scene";
import { Panel } from "@/components/blog/scene-panel";
import { PostIndex } from "@/components/blog/post-index";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on how I work: agent workflows, system design, data structures, and what I am building toward.",
  alternates: { canonical: "/blog" },
};

/**
 * The index as a curved wall of glass, seen through a headset.
 *
 * Three parts in DOM order: an intro that scrolls away, the arc that pins and
 * turns as you scroll, and the quiet index it lands in.
 *
 * The <h1> lives HERE, outside the arc, deliberately. It is the page's title
 * in every mode -- with the arc, without JS, and under the data-motion escape
 * hatch that removes the arc entirely -- so the one-h1 invariant blog.spec.ts
 * asserts never depends on which path rendered.
 *
 * Still a Server Component. The only client code is the arc's single scroll
 * listener; panels pass through it as children and stay on the server. No
 * <main> here -- app/blog/layout.tsx owns the landmark.
 */
export default function BlogIndex() {
  const posts = publishedPosts();
  /* Empty unless PLACEHOLDER_POSTS is set. They extend the ARC only -- never
     publishedPosts(), so they cannot reach allRoutes(), the sitemap,
     generateStaticParams or an OG image, and the index below lists real posts
     only, so the fallback stays entirely truthful. */
  const panels = scenePanels(posts, placeholderPosts());

  return (
    <>
      <header className="mx-auto max-w-3xl px-5 pt-16 pb-10">
        <h1 className="text-post-title">Blog</h1>
        <p className="mt-5 max-w-[52ch] text-post-lede text-muted">
          Notes on how I work. Agent workflows, system design, data structures,
          and what I am building toward.
        </p>
      </header>

      <PostScene
        count={panels.length}
        labels={panels.map((p) => (p.kind === "post" ? p.post.title : p.title))}
      >
        {panels.map((panel, i) => (
          <Panel key={panel.key} panel={panel} index={i} />
        ))}
      </PostScene>

      <PostIndex posts={posts} />
    </>
  );
}
