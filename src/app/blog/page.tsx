import type { Metadata } from "next";
import { publishedPosts } from "@/content/posts";
import { placeholderPosts } from "@/content/placeholder-posts";
import { PostScene } from "@/components/blog/post-scene";
import { PostCard } from "@/components/blog/post-card";
import { PostIndex } from "@/components/blog/post-index";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on how I work: agent workflows, system design, data structures, and what I am building toward.",
  alternates: { canonical: "/blog" },
};

/**
 * The index as a journey.
 *
 * Three parts, in DOM order: an intro that scrolls away, the scene that
 * pins and holds while posts fly forward to be chosen, and the quiet index
 * the journey lands in.
 *
 * The <h1> lives HERE, outside the scene, and that is deliberate. It is the
 * page's title in every mode -- with the scene, without JS, and under the
 * data-motion escape hatch that removes the scene entirely -- so the one-h1
 * invariant blog.spec.ts asserts never depends on which path rendered.
 *
 * Still a Server Component. The only client code is the scene's single
 * scroll listener; the cards pass through it as children and stay on the
 * server. No <main> here -- app/blog/layout.tsx owns the landmark.
 */
export default function BlogIndex() {
  const posts = publishedPosts();
  /* Empty unless PLACEHOLDER_POSTS is set. They extend the SCENE only -- they
     are never in publishedPosts(), so they cannot reach allRoutes(), the
     sitemap, generateStaticParams or an OG image. The index below lists real
     posts only, so the fallback stays entirely truthful. */
  const filler = placeholderPosts();

  return (
    <>
      <header className="mx-auto max-w-3xl px-5 pt-16 pb-10">
        <h1 className="text-post-title">Blog</h1>
        <p className="mt-5 max-w-[52ch] text-post-lede text-muted">
          Notes on how I work. Agent workflows, system design, data structures,
          and what I am building toward.
        </p>
      </header>

      <PostScene count={posts.length + filler.length}>
        {posts.map((p, i) => (
          <PostCard key={p.slug} post={p} index={i} />
        ))}
        {filler.map((p, i) => (
          <PostCard
            key={p.slug}
            post={p}
            index={posts.length + i}
            placeholder
          />
        ))}
      </PostScene>

      <PostIndex posts={posts} />
    </>
  );
}
