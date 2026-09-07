import { describe, it, expect, afterEach } from "vitest";
import { placeholderCount, placeholderPosts } from "@/content/placeholder-posts";
import { posts, publishedPosts } from "@/content/posts";
import { allRoutes } from "@/lib/routes";

const original = process.env.PLACEHOLDER_POSTS;
afterEach(() => {
  if (original === undefined) delete process.env.PLACEHOLDER_POSTS;
  else process.env.PLACEHOLDER_POSTS = original;
});

describe("Placeholder posts", () => {
  /**
   * The default is the whole safety argument. A fabricated post that reads as
   * real is the worst thing this site could ship, so "off" has to be what
   * happens when nobody says anything.
   */
  it("should_produce_none_when_the_flag_is_unset", () => {
    delete process.env.PLACEHOLDER_POSTS;
    expect(placeholderCount()).toBe(0);
    expect(placeholderPosts()).toEqual([]);
  });

  it("should_produce_none_when_the_flag_is_not_a_positive_number", () => {
    for (const value of ["", "0", "-3", "yes", "NaN"]) {
      process.env.PLACEHOLDER_POSTS = value;
      expect(placeholderCount(), value).toBe(0);
    }
  });

  it("should_clamp_an_absurd_count", () => {
    process.env.PLACEHOLDER_POSTS = "9999";
    expect(placeholderCount()).toBeLessThanOrEqual(24);
  });

  it("should_say_placeholder_in_every_title", () => {
    process.env.PLACEHOLDER_POSTS = "4";
    const made = placeholderPosts();
    expect(made).toHaveLength(4);
    for (const p of made) expect(p.title).toContain("PLACEHOLDER");
  });

  /**
   * seo.spec.ts bans em and en dashes anywhere a visitor can see, and a
   * placeholder card is visible.
   */
  it("should_never_contain_an_em_or_en_dash", () => {
    process.env.PLACEHOLDER_POSTS = "6";
    for (const p of placeholderPosts()) {
      expect(`${p.title} ${p.excerpt}`).not.toMatch(/[–—]/);
    }
  });

  it("should_use_iso_calendar_dates_like_real_posts", () => {
    process.env.PLACEHOLDER_POSTS = "5";
    for (const p of placeholderPosts()) {
      expect(p.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  /**
   * The containment claim, asserted rather than asserted-in-a-comment. A
   * placeholder that reached allRoutes() would get a sitemap entry, a
   * prerendered page and an OG image -- a fabricated post with a real URL.
   */
  it("should_never_reach_the_real_post_set_or_the_route_list", () => {
    process.env.PLACEHOLDER_POSTS = "8";
    const slugs = new Set(placeholderPosts().map((p) => p.slug));
    for (const p of posts) expect(slugs.has(p.slug)).toBe(false);
    for (const p of publishedPosts()) expect(slugs.has(p.slug)).toBe(false);
    for (const r of allRoutes()) {
      expect(slugs.has(r.path.replace("/blog/", ""))).toBe(false);
    }
  });
});
