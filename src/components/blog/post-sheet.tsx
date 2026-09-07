import Link from "next/link";
import type { CSSProperties } from "react";
import type { Post } from "@/content/types";
import { PostDate } from "@/components/blog/post-date";

/**
 * One sheet of paper on the desk.
 *
 * ONE table, not three parallel arrays. Depth, rotation and offset are three
 * facts about the same slot, and holding them apart meant they had to stay
 * the same length while only one of them defined the modulus -- add a
 * seventh rotation without a seventh depth and `--depth: undefinedpx` is an
 * invalid declaration, so the sheet silently falls back to the registered
 * 0px and flattens. As a single table that state cannot be expressed.
 *
 * The slots CYCLE rather than descending with recency, and that is
 * deliberate: Z encodes NOTHING here. Depth is atmosphere. Were it monotonic
 * with age it would be a chart, and at five posts a reader decodes the dates
 * faster than they decode the depth. Cycling also keeps the values bounded;
 * a monotonic ramp would send the twentieth post 250px behind the screen.
 *
 * Rotation stays under a degree. At 1.4deg it slanted an excerpt's baselines
 * enough to read as a crooked scan rather than a placed sheet -- the pile
 * comes from offset and overlap, not from angle. Offsets are tens of pixels,
 * not hundreds: an earlier version alternated flush-left/flush-right, which
 * threw consecutive sheets ~480px apart at 1440 and stopped them overlapping
 * at all. The offset is clamped in CSS so it collapses to 0 when the sheet
 * fills the column, which is the whole mobile case with no breakpoint.
 *
 * Resolved on the server from the index, never Math.random(): a random value
 * would differ between the server and client render and hydration would
 * mismatch.
 *
 * Sheets overlap into each other's PADDING band only, so the covered region
 * is always empty; occluded prose would just be a bug. The numbers are
 * deliberately not restated here -- they are --sheet-overlap and the padding
 * utility below, and blog.spec.ts asserts the relationship between them.
 */
const SLOTS = [
  { depth: 28, rot: -0.7, x: 0 },
  { depth: 8, rot: 0.5, x: 4 },
  { depth: 20, rot: -0.35, x: 1.5 },
  { depth: 3, rot: 0.8, x: 5 },
  { depth: 24, rot: -0.55, x: 2.5 },
  { depth: 13, rot: 0.3, x: 3 },
] as const;

export function PostSheet({ post, index }: { post: Post; index: number }) {
  const slot = SLOTS[index % SLOTS.length];

  return (
    <li
      className="post-sheet p-10"
      style={
        {
          "--depth": `${slot.depth}px`,
          "--sheet-rot": `${slot.rot}deg`,
          "--sheet-x": `${slot.x}rem`,
        } as CSSProperties
      }
    >
      <article>
        <PostDate published={post.published} />
        <h2 className="mt-3 text-post-h2">
          {/* Stretched link: the whole sheet is the hit area, but the
              accessible name is the title alone. Wrapping the sheet in an
              <a> would read the date and the full excerpt as the link text.
              layout.spec.ts's touch-target check already excludes elements
              carrying after:absolute. */}
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 after:content-[''] hover:text-accent-text"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 text-post-small text-muted">{post.excerpt}</p>
      </article>
    </li>
  );
}
