import { describe, it, expect } from "vitest";
import { projects, getProject } from "@/content/projects";
import { experience } from "@/content/experience";
import { profile } from "@/content/profile";
import { personJsonLd, projectJsonLd } from "@/lib/jsonld";

describe("getProject", () => {
  it("should_return_the_project_when_slug_matches", () => {
    expect(getProject("redis-lite")?.name).toBe("Redis Lite");
  });

  it("should_return_undefined_when_slug_is_unknown", () => {
    expect(getProject("nope")).toBeUndefined();
  });

  it("should_return_undefined_when_slug_is_empty", () => {
    expect(getProject("")).toBeUndefined();
  });
});

describe("Structured data", () => {
  it("should_emit_a_valid_person_schema", () => {
    const d = personJsonLd() as Record<string, unknown>;
    expect(d["@type"]).toBe("Person");
    expect(d.name).toBe(profile.name);
    expect(d.sameAs).toContain(profile.github);
  });

  it("should_emit_software_source_code_schema_per_project", () => {
    const d = projectJsonLd(projects[0]) as Record<string, unknown>;
    expect(d["@type"]).toBe("SoftwareSourceCode");
    expect(d.url).toContain(projects[0].slug);
  });

  it("should_omit_codeRepository_when_the_project_has_no_links_yet", () => {
    // links is deliberately optional until the repos are public.
    const withoutLinks = projects.find((p) => !p.links?.github);
    if (!withoutLinks) return;
    expect(projectJsonLd(withoutLinks)).not.toHaveProperty("codeRepository");
  });

  it("should_survive_json_serialisation_without_script_breakout", () => {
    const s = JSON.stringify(personJsonLd()).replace(/</g, "\\u003c");
    expect(s).not.toMatch(/<\/script/i);
  });
});

describe("Experience data", () => {
  it("should_order_entries_most_recent_first", () => {
    expect(experience[0].end).toBe("Present");
  });

  it("should_give_every_entry_an_iso_start_date_for_the_time_element", () => {
    for (const e of experience) {
      expect(e.startISO, e.org).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  it("should_omit_endISO_only_when_the_role_is_current", () => {
    for (const e of experience) {
      if (e.end === "Present") expect(e.endISO, e.org).toBeUndefined();
      else expect(e.endISO, e.org).toMatch(/^\d{4}-\d{2}$/);
    }
  });
});

describe("Site URL resolution", () => {
  it("should_never_hardcode_a_domain_in_metadata_sources", async () => {
    // Regression: the origin was hardcoded in four files, so a wrong domain
    // silently propagated into metadataBase, OG tags, sitemap, robots and
    // JSON-LD at once.
    const fs = await import("node:fs/promises");
    const files = [
      "src/app/layout.tsx",
      "src/app/sitemap.ts",
      "src/app/robots.ts",
      "src/lib/jsonld.ts",
    ];
    for (const f of files) {
      const src = await fs.readFile(f, "utf8");
      expect(src, `${f} must not hardcode an origin`).not.toMatch(
        /https:\/\/[a-z0-9-]+\.vercel\.app/,
      );
    }
  });

  it("should_fall_back_to_localhost_when_no_deploy_env_is_present", async () => {
    const { SITE_URL } = await import("@/lib/site");
    // Tests run without VERCEL_PROJECT_PRODUCTION_URL set.
    expect(SITE_URL).toBe("http://localhost:3000");
  });

  it("should_build_absolute_urls_from_the_shared_origin", () => {
    // Record<string, unknown>: the schema mixes strings, arrays and nested
    // objects, so a string-valued cast does not overlap and TS rejects it.
    const d = personJsonLd() as Record<string, unknown>;
    expect(d.url).toBe("http://localhost:3000");
  });
});
