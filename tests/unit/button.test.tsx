import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

/**
 * Button routes to one of three elements. Getting this wrong is silent —
 * an external link rendered through next/link still *looks* right but loses
 * rel="noreferrer" and the "opens in new tab" announcement.
 */
describe("Button element routing", () => {
  it("should_render_next_link_when_href_is_internal", () => {
    render(<Button href="/work/redis-lite">Redis Lite</Button>);
    const el = screen.getByRole("link", { name: /redis lite/i });
    expect(el).toHaveAttribute("href", "/work/redis-lite");
    expect(el).toHaveAttribute("data-next-link", "true");
    expect(el).not.toHaveAttribute("target");
  });

  it("should_render_plain_anchor_when_href_is_external", () => {
    render(<Button href="https://github.com/vinh28012003">GitHub</Button>);
    const el = screen.getByRole("link", { name: /github/i });
    expect(el).not.toHaveAttribute("data-next-link");
    expect(el).toHaveAttribute("target", "_blank");
  });

  it("should_render_button_element_when_no_href", () => {
    render(<Button onClick={() => {}}>Try again</Button>);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("should_render_anchor_when_download_even_though_href_is_internal", () => {
    render(
      <Button href="/resume/vinh-tran-resume.pdf" download>
        Resume
      </Button>,
    );
    const el = screen.getByRole("link", { name: /resume/i });
    // A download must not go through the client router.
    expect(el).not.toHaveAttribute("data-next-link");
    expect(el).toHaveAttribute("download");
  });
});

describe("Button external-link safety", () => {
  it("should_set_rel_noreferrer_when_href_is_external", () => {
    render(<Button href="https://linkedin.com/in/vinhtran2801">LinkedIn</Button>);
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "rel",
      "noreferrer",
    );
  });

  it("should_announce_new_tab_to_screen_readers_when_href_is_external", () => {
    render(<Button href="https://github.com/vinh28012003">GitHub</Button>);
    // The accessible name must carry the warning; an icon alone would not.
    expect(
      screen.getByRole("link", { name: /github \(opens in new tab\)/i }),
    ).toBeInTheDocument();
  });

  it("should_not_announce_new_tab_when_href_is_internal", () => {
    render(<Button href="/#projects">See the projects</Button>);
    expect(screen.getByRole("link").textContent).not.toMatch(/opens in new tab/i);
  });
});

describe("Button touch target and variants", () => {
  it("should_meet_the_44px_touch_target_floor_on_every_variant", () => {
    for (const variant of ["primary", "secondary", "ghost"] as const) {
      const { unmount } = render(
        <Button href="/" variant={variant}>
          Label
        </Button>,
      );
      const cls = screen.getByRole("link").className;
      // min-h-12 = 48px, min-h-11 = 44px. Either clears the gate.
      expect(cls, `variant=${variant}`).toMatch(/min-h-1[12]|min-h-14/);
      unmount();
    }
  });

  it("should_use_the_ground_pair_not_hardcoded_ink_so_it_survives_inversion", () => {
    // Regression: `text-ink` inside an inverted block rendered #0A0A0A on
    // #0A0A0A — a 1:1 contrast, fully invisible button.
    render(<Button href="/">Label</Button>);
    const cls = screen.getByRole("link").className;
    expect(cls).toMatch(/text-on-ground/);
    expect(cls).not.toMatch(/text-ink\b/);
  });
});
