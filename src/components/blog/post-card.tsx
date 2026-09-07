import Link from "next/link";
import type { CSSProperties } from "react";
import type { Post } from "@/content/types";
import { PostDate } from "@/components/blog/post-date";

/**
 * One beat of the narrative: a post, flying out of the dark to be chosen.
 *
 * The card carries only its index. Everything else -- how far away it is,
 * how bright, whether it is the subject -- is derived in CSS from the single
 * --scene-progress the stage publishes. That is why there is no per-card
 * JavaScript and why the geometry stays correct at any post count.
 *
 * Every word sits on an opaque face, deliberately. The ground colour travels
 * across the journey, and text on a travelling ground has travelling
 * contrast. The a11y sweep cannot catch that, because settle() sets
 * data-motion and the CSS arm removes the whole scene before it measures --
 * so blog-scene.spec.ts checks contrast at several progress values instead.
 */
export function PostCard({
  post,
  index,
  placeholder = false,
}: {
  post: Post;
  index: number;
  /* Renders a badge and drops the link. A fake post that looks real is the
     one thing this site must not ship, so the marker is loud and the card is
     inert rather than pointing at a URL that does not exist. */
  placeholder?: boolean;
}) {
  return (
    <li
      className="scene-card"
      style={{ "--i": index } as CSSProperties}
    >
      <article className="scene-card-face relative p-8 md:p-10">
        {placeholder ? (
          <p className="mb-4 inline-flex bg-accent px-2 py-1 font-sans text-post-meta uppercase text-accent-fg">
            Placeholder
          </p>
        ) : null}
        <PostDate published={post.published} />
        <h2 className="mt-3 text-post-h2">
          {/* Stretched link: the whole face is the hit area, but the
              accessible name is the title alone. Wrapping the card in an <a>
              would read the date and the entire excerpt as the link text.
              layout.spec.ts's touch-target check already excludes elements
              carrying after:absolute. */}
          {placeholder ? (
            post.title
          ) : (
            <Link
              href={`/blog/${post.slug}`}
              className="after:absolute after:inset-0 after:content-[''] hover:text-accent-text"
            >
              {post.title}
            </Link>
          )}
        </h2>
        <p className="mt-3 text-post-small text-muted">{post.excerpt}</p>
      </article>
    </li>
  );
}
