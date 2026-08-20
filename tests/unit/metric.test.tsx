import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Metric } from "@/components/ui/metric";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import type { Metric as MetricData } from "@/content/types";

const standalone: MetricData = {
  value: "375K",
  suffix: "+",
  unit: "OPS/SEC",
  plain: "375,000 or more operations per second.",
};

const delta: MetricData = {
  from: "500ms",
  to: "80ms",
  value: "80ms",
  unit: "PRICE UPDATE DELAY",
  plain: "Price update delay reduced from 500 milliseconds to 80 milliseconds.",
};

describe("Metric rendering", () => {
  it("should_render_value_and_suffix_when_metric_is_standalone", () => {
    const { container } = render(<Metric metric={standalone} />);
    expect(container.textContent).toContain("375K");
    expect(container.textContent).toContain("+");
  });

  it("should_render_both_endpoints_when_metric_is_a_delta", () => {
    const { container } = render(<Metric metric={delta} />);
    expect(container.textContent).toContain("500ms");
    expect(container.textContent).toContain("80ms");
  });

  it("should_use_an_svg_arrow_not_a_glyph_when_metric_is_a_delta", () => {
    // A "→" glyph renders inconsistently across the fallback stack during
    // the font swap window, so the arrow must be drawn.
    const { container } = render(<Metric metric={delta} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.textContent).not.toContain("→");
  });
});

describe("Metric accessibility contract", () => {
  it("should_expose_the_plain_sentence_to_screen_readers", () => {
    render(<Metric metric={delta} />);
    expect(screen.getByText(delta.plain)).toBeInTheDocument();
  });

  it("should_hide_the_visual_arrangement_from_screen_readers", () => {
    // Every visual node is aria-hidden so AT reads `plain` only, never
    // "500ms 80ms PRICE UPDATE DELAY" as disconnected fragments.
    const { container } = render(<Metric metric={delta} />);
    const visual = container.querySelectorAll('[aria-hidden="true"]');
    expect(visual.length).toBeGreaterThan(0);
  });

  it("should_not_render_a_glyph_only_value_without_a_text_alternative", () => {
    const { container } = render(<Metric metric={standalone} />);
    expect(container.querySelector(".sr-only")?.textContent).toBe(standalone.plain);
  });
});

describe("Content invariants", () => {
  it("should_carry_a_plain_sentence_on_every_metric_in_the_content_layer", () => {
    const all = [
      ...projects.flatMap((p) => p.headlineMetrics),
      ...experience.flatMap((e) => e.bullets.flatMap((b) => (b.metric ? [b.metric] : []))),
    ];
    expect(all.length).toBeGreaterThan(10);
    for (const m of all) {
      expect(m.plain, `unit=${m.unit}`).toBeTruthy();
      expect(m.plain.length, `unit=${m.unit}`).toBeGreaterThan(10);
    }
  });

  it("should_cap_headline_metrics_at_three_because_the_card_layout_breaks_past_it", () => {
    for (const p of projects) {
      expect(p.headlineMetrics.length, p.slug).toBeLessThanOrEqual(3);
    }
  });

  it("should_give_every_project_a_unique_slug", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
