import type { Metadata } from "next";
import Link from "next/link";
import { publishedPosts } from "@/content/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on how I work: agent workflows, system design, data structures, and what I am building toward.",
  alternates: { canonical: "/blog" },
};

/**
 * The index, and the ONLY file Phase 2 replaces.
 *
 * Everything Phase 2 needs is already true here: each card is a real <a> in
 * the DOM (so it stays crawlable when the CSS 3D goes on), the data comes
 * from the same publishedPosts() the post pages use, and nothing between
 * .blog and this list carries a transform.
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

      <ul className="mt-16 flex flex-col">
        {posts.map((p) => (
          <li key={p.slug} className="border-t border-rule py-8">
            <article>
              <p className="text-post-meta uppercase tracking-[0.06em] text-muted">
                <time dateTime={p.published}>
                  {new Date(`${p.published}T00:00:00Z`).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    },
                  )}
                </time>
              </p>
              <h2 className="mt-3 text-post-h2">
                <Link
                  href={`/blog/${p.slug}`}
                  className="hover:text-accent-text"
                >
                  {p.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-[62ch] text-muted">{p.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
