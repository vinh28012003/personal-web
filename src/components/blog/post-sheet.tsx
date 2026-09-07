import Link from "next/link";
import type { CSSProperties } from "react";
import type { Post } from "@/content/types";
import { PostDate } from "@/components/blog/post-date";

/**
 * One sheet of paper on the desk.
 *
 * Depth and rotation cycle on a fixed six-slot table rather than descending
 * with recency, and that is deliberate: Z encodes NOTHING here. Depth is
 * atmosphere. Were it monotonic with age it would be a chart, and at five
 * posts a reader decodes the dates faster than they decode the depth. The
 * cycle also keeps the values bounded -- a monotonic ramp would send the
 * twentieth post 250px behind the screen.
 *
 * Computed on the server from the index, never Math.random(): a random value
 * would differ between the server and client render and produce a hydration
 * mismatch.
 *
 * Sheets overlap by --sheet-overlap into each other's PADDING band only. The
 * padding is 2rem and the overlap 1.5rem, so the covered region is always
 * empty. Occlusion is the depth cue; occluded prose would just be a bug.
 */
const DEPTH_PX = [28, 8, 20, 3, 24, 13];
/* Under a degree. Looked at on a render: 1.4deg slants an excerpt's
   baselines enough to read as a crooked scan rather than a placed sheet.
   The pile has to come from offset and overlap, not from angle. */
const ROT_DEG = [-0.7, 0.5, -0.35, 0.8, -0.55, 0.3];
/* Papers dropped roughly on each other are offset by tens of pixels, not
   hundreds. The first version alternated flush-left/flush-right, which threw
   consecutive sheets ~480px apart at 1440 and stopped them overlapping at
   all. Clamped in CSS so it collapses to 0 when the sheet fills the column. */
const OFFSET_REM = [0, 4, 1.5, 5, 2.5, 3];

export function PostSheet({ post, index }: { post: Post; index: number }) {
  const slot = index % DEPTH_PX.length;

  return (
    <li
      className={[
        "post-sheet p-10",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--depth": `${DEPTH_PX[slot]}px`,
          "--sheet-rot": `${ROT_DEG[slot]}deg`,
          "--sheet-x": `${OFFSET_REM[slot]}rem`,
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
