import { test, expect } from "@playwright/test";

/**
 * The design rule is that correctness never depends on animation. These
 * three tests are the enforcement: content must be readable with JS off,
 * with reduced motion on, and in print — none of which run the observer.
 */

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("all content is visible and nothing is stranded at opacity 0", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /redis lite/i }),
    ).toBeVisible();
    const opacities = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal]")].map(
        (el) => getComputedStyle(el).opacity,
      ),
    );
    expect(opacities.length).toBeGreaterThan(0);
    expect(opacities.every((o) => o === "1")).toBe(true);
  });

  test("the no-js guard class survives so the hiding CSS never applies", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html.no-js")).toHaveCount(1);
  });
});

test.describe("prefers-reduced-motion", () => {
  test("renders the final state immediately with no transition", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const state = await page
      .locator("[data-reveal]")
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          opacity: s.opacity,
          transform: s.transform,
          duration: s.transitionDuration,
        };
      });
    expect(state.opacity).toBe("1");
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(state.transform);
  });
});

test("print stylesheet reveals everything for print-to-PDF", async ({
  page,
}) => {
  await page.goto("/");
  await page.emulateMedia({ media: "print" });
  const opacities = await page.evaluate(() =>
    [...document.querySelectorAll("[data-reveal]")].map(
      (el) => getComputedStyle(el).opacity,
    ),
  );
  expect(opacities.every((o) => o === "1")).toBe(true);
});

test("dark mode swaps the two tokens that would otherwise fail AA", async ({
  page,
}) => {
  // Set the theme the way next-themes does. Adding the class by hand races
  // with the provider, which re-applies its own resolved theme on mount.
  await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
  await page.goto("/");
  await expect(page.locator("html.dark")).toHaveCount(1);

  const t = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return {
      muted: s.getPropertyValue("--muted").trim().toLowerCase(),
      accentText: s.getPropertyValue("--accent-text").trim().toLowerCase(),
    };
  });
  expect(t.muted).toContain("9c9c96");
  expect(t.accentText).toContain("ff3b00");
});
