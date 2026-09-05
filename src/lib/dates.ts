/**
 * The one place a post date becomes human-readable.
 *
 * Post.published is a bare calendar date, "2026-09-05". Passing that straight
 * to `new Date()` parses it as midnight UTC, and toLocaleDateString then
 * renders it in the runtime's zone -- so the same string prints "September 5"
 * on a server in UTC and "September 4" anywhere west of it. The build machine
 * and the reader do not share a timezone, so that is a real wrong answer, not
 * a theoretical one.
 *
 * Pinning BOTH ends is what fixes it: `T00:00:00Z` to parse as UTC, and
 * `timeZone: "UTC"` to format back in UTC. Dropping either one reintroduces
 * the shift, which is why this is a function and not two lines copied to each
 * call site -- it was copied to two, and nothing asserted they agreed.
 *
 * A calendar date has no time and no zone. Formatting it in UTC is not a
 * default; it is the only reading that keeps the printed day equal to the
 * authored day everywhere on earth.
 */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
