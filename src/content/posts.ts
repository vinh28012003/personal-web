import type { Post } from "./types";

/**
 * Post metadata. The prose lives beside this in posts/<slug>.mdx.
 *
 * Two files per post is deliberate -- see the note at the top of types.ts.
 * posts.test.ts asserts the two sides stay in step: every record has a file,
 * every file has a record.
 *
 * Newest first. Enforced here so no call site has to sort.
 */
export const posts: readonly Post[] = [
  {
    slug: "what-i-am-working-toward",
    title: "What I am working toward",
    published: "2026-09-05",
    excerpt:
      "Two projects built to find out which parts of a system I only thought I understood, and where that points next.",
    tags: ["system-design", "workflow"],
    // Draft: the direction sections still need real content. See the MDX.
    draft: true,
  },
  {
    slug: "system-design-by-building",
    title: "System design, learned by building it wrong first",
    published: "2026-09-05",
    excerpt:
      "Backpressure, durability and consensus are easy to read about and hard to believe until something you wrote falls over. What two projects actually taught me.",
    tags: ["system-design"],
  },
  {
    slug: "how-i-use-claude-code",
    title: "How I use Claude Code",
    published: "2026-09-04",
    excerpt:
      "A six-layer protocol for working with an agent that writes code: what it decides, what I decide, and why the last gate is looking at a render rather than a green test suite.",
    tags: ["claude-code", "workflow"],
  },
];

/**
 * The published set.
 *
 * Every route-shaped consumer goes through this rather than `posts`, so
 * generateStaticParams, generateMetadata, the sitemap and notFound() share
 * one definition of "exists". A draft that 200s at its URL while being
 * absent from the sitemap is then not a state the code can reach.
 */
export function publishedPosts(): readonly Post[] {
  return posts.filter((p) => !p.draft);
}

export function getPost(slug: string): Post | undefined {
  return publishedPosts().find((p) => p.slug === slug);
}
