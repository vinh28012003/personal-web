import { describe, it, expect } from "vitest";
import { scenePanels, openingPanels, closingPanels } from "@/content/scene-panels";
import { publishedPosts } from "@/content/posts";

describe("Scene panels", () => {
  it("should_wrap_every_published_post_in_a_post_panel", () => {
    const posts = publishedPosts();
    const made = scenePanels(posts).filter((p) => p.kind === "post");
    expect(made).toHaveLength(posts.length);
  });

  it("should_open_with_a_note_and_close_with_notes", () => {
    const made = scenePanels(publishedPosts());
    expect(made[0].kind).toBe("note");
    expect(made[made.length - 1].kind).toBe("note");
  });

  /**
   * An arc of two panels is not an arc. This is the floor that makes the
   * geometry read as a curve on the day it ships, with two posts.
   */
  it("should_give_the_arc_at_least_five_panels_today", () => {
    expect(scenePanels(publishedPosts()).length).toBeGreaterThanOrEqual(5);
  });

  it("should_give_every_panel_a_unique_key", () => {
    const keys = scenePanels(publishedPosts()).map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  /**
   * The note panels must not make claims. Each either restates something the
   * site already publishes or points at something that already exists.
   */
  it("should_only_point_at_targets_that_exist", () => {
    for (const p of [...openingPanels(), ...closingPanels()]) {
      if (p.kind !== "note" || !p.href) continue;
      expect(p.href === "/" || p.href.startsWith("#")).toBe(true);
    }
  });

  it("should_never_contain_an_em_or_en_dash", () => {
    for (const p of [...openingPanels(), ...closingPanels()]) {
      if (p.kind !== "note") continue;
      expect(`${p.title} ${p.body}`).not.toMatch(/[–—]/);
    }
  });
});

describe("Placeholder panels", () => {
  /**
   * The flag is a separate argument rather than something the caller
   * concatenates in, so it cannot be lost on the way. The panel renders a
   * badge and drops the link off the back of it.
   */
  it("should_flag_placeholders_and_leave_real_posts_unflagged", () => {
    const real = publishedPosts();
    const fake = [
      {
        slug: "placeholder-1",
        title: "PLACEHOLDER post 1",
        published: "2026-01-01",
        excerpt: "x",
        tags: [] as const,
      },
    ];
    const made = scenePanels(real, fake);
    const posts = made.filter((p) => p.kind === "post");
    expect(posts.filter((p) => p.placeholder)).toHaveLength(1);
    expect(posts.filter((p) => !p.placeholder)).toHaveLength(real.length);
  });

  it("should_add_no_placeholders_when_none_are_passed", () => {
    const made = scenePanels(publishedPosts());
    expect(made.some((p) => p.kind === "post" && p.placeholder)).toBe(false);
  });
});
