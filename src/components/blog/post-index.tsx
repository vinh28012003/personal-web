import Link from "next/link";
import type { Post } from "@/content/types";
import { PostDate } from "@/components/blog/post-date";

/**
 * The destination, and the fallback.
 *
 * Two jobs in one component, which is why it is plain: it is where the
 * journey lands, and it is the whole page for anyone whose scene never runs
 * -- no JS, or the data-motion escape hatch. Both remove the track and leave
 * this, so the fallback is not a degraded copy of the index. It IS the index.
 *
 * Headings are h2 for the section and h3 for each post, one level under the
 * cards above, so a reader tabbing through does not meet the same title
 * twice at the same rank.
 */
export function PostIndex({ posts }: { posts: readonly Post[] }) {
  return (
    <section id="all-notes" className="mx-auto max-w-3xl px-5 py-24">
      <h2 className="text-post-h2">All posts</h2>
      <ul className="mt-8 flex flex-col">
        {posts.map((p) => (
          <li key={p.slug} className="border-t border-rule py-8">
            <article>
              <PostDate published={p.published} />
              <h3 className="mt-3 text-post-h3">
                <Link
                  href={`/blog/${p.slug}`}
                  className="hover:text-accent-text"
                >
                  {p.title}
                </Link>
              </h3>
              <p className="mt-3 max-w-[62ch] text-post-small text-muted">
                {p.excerpt}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
