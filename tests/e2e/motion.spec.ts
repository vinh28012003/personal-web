import { test, expect } from "@playwright/test";

/**
 * The 3D and page-transition work must not weaken the resilience rules:
 * nothing may be stranded invisible, and motion must be optional.
 */

test("page-enter never strands content at opacity 0", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-page-enter="in"]')).toHaveCount(1);
  // The 240ms tween may still be mid-flight; the invariant is that it
  // SETTLES at 1, not that it is 1 the instant we look.
  await expect
    .poll(
      () =>
        page
          .locator("[data-page-enter]")
          .evaluate((el) => getComputedStyle(el).opacity),
      { timeout: 3000 },
    )
    .toBe("1");
});

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("page-enter guard never hides content when JS never runs", async ({ page }) => {
    await page.goto("/");
    // The hiding rule is scoped html:not(.no-js), so with JS off it cannot apply.
    const opacity = await page
      .locator("[data-page-enter]")
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("prefers-reduced-motion", () => {
  test("3D tilt and page transition are both disabled", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const card = page.locator(".slab-3d").first();
    const s = await card.evaluate((el) => {
      const c = getComputedStyle(el);
      return { transform: c.transform, transition: c.transitionDuration };
    });
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(s.transform);
    expect(s.transition === "0s" || s.transition === "0ms").toBe(true);

    const enter = await page
      .locator("[data-page-enter]")
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(enter).toBe("1");
  });
});

test("3D depth only animates transform, never a layout property", async ({ page }) => {
  await page.goto("/");
  const transition = await page
    .locator(".slab-3d")
    .first()
    .evaluate((el) => getComputedStyle(el).transitionProperty);
  // Animating width/height/top/left would cause layout thrash and CLS.
  expect(transition).toBe("transform");
});

test("the extruded hero uses hard shadows with zero blur", async ({ page }) => {
  await page.goto("/");
  const shadow = await page
    .locator("h1.text-extruded")
    .evaluate((el) => getComputedStyle(el).textShadow);
  expect(shadow).not.toBe("none");
  // Brutalist extrusion: offsets only. Any px triple would mean a blur radius.
  const blurs = [...shadow.matchAll(/(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/g)];
  for (const m of blurs) expect(parseFloat(m[3])).toBe(0);
});

test("hover 3D is not the only affordance on a card", async ({ page }) => {
  await page.goto("/");
  // Touch devices get no hover at all, so the border, shadow and link must
  // carry the affordance on their own.
  const card = page.locator("article").filter({ hasText: "Redis Lite" }).first();
  const s = await card.evaluate((el) => {
    const c = getComputedStyle(el);
    return { border: parseFloat(c.borderTopWidth), shadow: c.boxShadow };
  });
  expect(s.border).toBeGreaterThanOrEqual(2);
  expect(s.shadow).not.toBe("none");
  await expect(card.getByRole("link")).toHaveCount(1);
});
