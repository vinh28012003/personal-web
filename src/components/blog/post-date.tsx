import { formatPostDate } from "@/lib/dates";

/**
 * The dateline above a post title, on the index and on the post itself.
 *
 * Both the machine-readable value and the human one come from the same ISO
 * string, so <time datetime> can never disagree with the text beside it. That
 * pairing is the entire reason this is a component rather than a bare call to
 * formatPostDate(): the two used to be assembled by hand at each site.
 *
 * No arbitrary tracking utility here. --text-post-meta--letter-spacing is
 * 0.06em and the compiled utility already reads it:
 *   .text-post-meta{...letter-spacing:var(--tw-tracking,var(--text-post-meta--letter-spacing))}
 * The arbitrary class that used to sit alongside it set --tw-tracking to the
 * identical number, which silently made the token unchangeable.
 *
 * Written without the class name spelled out on purpose: Tailwind scans source
 * files as plain text and does not know what a comment is, so naming it here
 * regenerates the very rule this change deleted. Verified -- it did, until
 * this sentence replaced it.
 */
export function PostDate({ published }: { published: string }) {
  return (
    <p className="text-post-meta uppercase text-muted">
      <time dateTime={published}>{formatPostDate(published)}</time>
    </p>
  );
}
