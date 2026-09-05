import { describe, it, expect } from "vitest";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { posts, publishedPosts, getPost } from "@/content/posts";
import { postJsonLd } from "@/lib/jsonld";
import { allRoutes } from "@/lib/routes";

describe("getPost", () => {
  it("should_return_the_post_when_slug_matches", () => {
    expect(getPost("how-i-use-claude-code")?.title).toBe("How I use Claude Code");
  });

  it("should_return_undefined_when_slug_is_unknown", () => {
    expect(getPost("nope")).toBeUndefined();
  });

  it("should_return_undefined_when_slug_is_empty", () => {
    expect(getPost("")).toBeUndefined();
  });
});

describe("Post dates", () => {
  /**
   * These are the first machine-readable dates on the site, and four surfaces
   * read them: <time datetime>, sitemap lastModified, BlogPosting, and the
   * index sort. A "Sept 4 2026" typo would degrade all four silently.
   */
  it("should_use_iso_calendar_dates", () => {
    for (const p of posts) {
      expect(p.published, `${p.slug} published`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (p.updated) {
        expect(p.updated, `${p.slug} updated`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should_never_be_updated_before_published", () => {
    for (const p of posts) {
      if (p.updated) expect(p.updated >= p.published, p.slug).toBe(true);
    }
  });

  it("should_order_entries_most_recent_first", () => {
    const dates = posts.map((p) => p.published);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

describe("Post structured data", () => {
  it("should_emit_a_blog_posting_schema", () => {
    const json = postJsonLd(publishedPosts()[0]);
    expect(json["@type"]).toBe("BlogPosting");
    expect(json.headline).toBe(publishedPosts()[0].title);
    expect(json.datePublished).toBe(publishedPosts()[0].published);
    expect(json.mainEntityOfPage["@id"]).toBe(json.url);
  });

  it("should_omit_dateModified_when_the_post_has_not_been_revised", () => {
    expect(postJsonLd(publishedPosts()[0])).not.toHaveProperty("dateModified");
  });
});

describe("Draft handling", () => {
  /**
   * One definition of "exists" across generateStaticParams, generateMetadata,
   * the sitemap and notFound(). A draft that 200s at its URL while being
   * absent from the sitemap is the state this makes unreachable.
   */
  it("should_exclude_drafts_from_the_published_set", () => {
    expect(publishedPosts().every((p) => !p.draft)).toBe(true);
  });

  it("should_exclude_drafts_from_the_route_list", () => {
    const drafted = posts.filter((p) => p.draft).map((p) => `/blog/${p.slug}`);
    const paths = allRoutes().map((r) => r.path);
    for (const d of drafted) expect(paths).not.toContain(d);
  });

  it("should_list_every_published_post_in_the_route_list", () => {
    const paths = allRoutes().map((r) => r.path);
    for (const p of publishedPosts()) expect(paths).toContain(`/blog/${p.slug}`);
  });

  it("should_carry_a_lastModified_for_every_post_route", () => {
    const postRoutes = allRoutes().filter((r) => r.path.startsWith("/blog/"));
    expect(postRoutes.length).toBe(publishedPosts().length);
    for (const r of postRoutes) expect(r.lastModified).toBeTruthy();
  });
});

describe("Manifest and prose stay in step", () => {
  /**
   * A post is two files by design: the typed record here, the prose in
   * posts/<slug>.mdx. That buys compile-checked metadata and costs the risk
   * of the two drifting, so the drift is what gets asserted.
   *
   * A record with no file is a build failure at the dynamic import. A file
   * with no record is worse: it is invisible, unreachable and silent.
   */
  it("should_have_one_mdx_file_per_record_and_no_orphans", async () => {
    const dir = resolve(process.cwd(), "src/content/posts");
    const files = (await readdir(dir))
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, ""))
      .sort();
    const slugs = posts.map((p) => p.slug).sort();
    expect(files).toEqual(slugs);
  });
});
