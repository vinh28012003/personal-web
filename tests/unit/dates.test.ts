import { describe, it, expect } from "vitest";
import { formatPostDate } from "@/lib/dates";
import { posts } from "@/content/posts";

describe("formatPostDate", () => {
  it("should_render_the_authored_calendar_day", () => {
    expect(formatPostDate("2026-09-05")).toBe("September 5, 2026");
  });

  /**
   * The regression this function exists to prevent.
   *
   * `new Date("2026-09-01")` parses as midnight UTC, so formatting it in a
   * negative-offset zone rolls it back to August 31. The build machine, Vercel
   * and the reader do not share a timezone, so the naive version prints a
   * different day depending on where it runs -- and it is right on the machine
   * of whoever writes it, which is why it survives review.
   *
   * TZ is set per-process, so this asserts the helper is immune rather than
   * mutating global state: a UTC-pinned formatter returns the same string no
   * matter what the ambient zone is.
   */
  it("should_not_shift_the_day_in_a_negative_offset_timezone", () => {
    const iso = "2026-09-01";

    // What the code used to do at each call site, evaluated in Los Angeles.
    const naive = new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Los_Angeles",
    });

    expect(naive).toBe("August 31, 2026"); // the bug, reproduced
    expect(formatPostDate(iso)).toBe("September 1, 2026"); // the fix
  });

  it("should_not_shift_the_day_in_a_positive_offset_timezone", () => {
    const iso = "2026-12-31";
    expect(formatPostDate(iso)).toBe("December 31, 2026");
  });

  it("should_handle_a_leap_day", () => {
    expect(formatPostDate("2028-02-29")).toBe("February 29, 2028");
  });

  /**
   * Every real post date, not just the fixtures above. posts.test.ts already
   * asserts the strings are ISO; this asserts they survive formatting, so a
   * date that parses but is nonsense (2026-02-30) cannot reach a page as
   * "Invalid Date".
   */
  it("should_format_every_post_in_the_manifest", () => {
    for (const p of posts) {
      expect(formatPostDate(p.published), p.slug).not.toContain("Invalid");
      if (p.updated) {
        expect(formatPostDate(p.updated), `${p.slug} updated`).not.toContain(
          "Invalid",
        );
      }
    }
  });
});
