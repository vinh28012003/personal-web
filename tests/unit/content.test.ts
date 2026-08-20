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
