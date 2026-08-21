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

  test("page-enter guard never hides content when JS never runs", async ({
    page,
  }) => {
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

test("3D depth only animates transform, never a layout property", async ({
  page,
}) => {
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
  const blurs = [
    ...shadow.matchAll(/(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/g),
  ];
  for (const m of blurs) expect(parseFloat(m[3])).toBe(0);
});

test("hover 3D is not the only affordance on a card", async ({ page }) => {
  await page.goto("/");
  // Touch devices get no hover at all, so the border, shadow and link must
  // carry the affordance on their own.
  const card = page
    .locator("article")
    .filter({ hasText: "Redis Lite" })
    .first();
  const s = await card.evaluate((el) => {
    const c = getComputedStyle(el);
    return { border: parseFloat(c.borderTopWidth), shadow: c.boxShadow };
  });
  expect(s.border).toBeGreaterThanOrEqual(2);
  expect(s.shadow).not.toBe("none");
  await expect(card.getByRole("link")).toHaveCount(1);
});

/* ── first-visit 3D intro ─────────────────────────────────────────────── */

test("the 3D intro plays on a fresh session and only once", async ({
  page,
}) => {
  await page.goto("/");
  // The hook is set synchronously on mount, before the 1.6s cleanup.
  await expect(page.locator('html[data-intro="run"]')).toHaveCount(1);

  // Second visit in the same session must not replay it.
  await page.goto("/resume");
  await page.goto("/");
  await page.waitForTimeout(200);
  await expect(page.locator('html[data-intro="run"]')).toHaveCount(0);
});

test("intro elements are never hidden by default — animation is opt-in", async ({
  page,
}) => {
  await page.goto("/");
  // Clear the session flag and reload so no intro runs at all.
  await page.evaluate(() => sessionStorage.clear());
  await page.addInitScript(() => sessionStorage.setItem("intro-played", "1"));
  await page.reload();
  await page.waitForTimeout(150);

  await expect(page.locator('html[data-intro="run"]')).toHaveCount(0);
  const opacity = await page
    .locator(".intro-line")
    .first()
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe("1");
});

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("hero is fully visible with no intro when JS never runs", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html[data-intro]")).toHaveCount(0);
    for (const sel of [".intro-line", ".intro-fade"]) {
      const o = await page
        .locator(sel)
        .first()
        .evaluate((el) => getComputedStyle(el).opacity);
      expect(o, sel).toBe("1");
    }
  });
});

/* ── scroll-driven reveal ─────────────────────────────────────────────── */

test("scroll-driven reveal settles at full opacity once scrolled past", async ({
  page,
}) => {
  await page.goto("/");
  // Walk the page the way a reader does.
  for (let y = 0; y <= 4000; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(300);

  const stranded = await page.evaluate(() =>
    [...document.querySelectorAll("[data-reveal]")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        // Only judge elements scrolled ENTIRELY past. An element part-way
        // into the viewport is meant to be mid-animation — that is the
        // whole point of tying the reveal to scroll position.
        return r.bottom < 0 && parseFloat(getComputedStyle(el).opacity) < 0.99;
      })
      .map((el) => (el.textContent || "").trim().slice(0, 30)),
  );
  expect(stranded, stranded.join("\n")).toEqual([]);
});

test("the motion escape hatch forces every reveal to its end state", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    document.documentElement.setAttribute("data-motion", "off"),
  );
  await page.waitForTimeout(120);
  const opacities = await page.evaluate(() =>
    [...document.querySelectorAll("[data-reveal]")].map(
      (el) => getComputedStyle(el).opacity,
    ),
  );
  expect(opacities.length).toBeGreaterThan(0);
  expect(opacities.every((o) => o === "1")).toBe(true);
});

/**
 * Regression: the intro used to be armed from a useEffect. Two failures came
 * out of that — the effect ran ~400ms after navigation, so the hero painted
 * finished and then jumped back to animate; and React StrictMode's
 * double-invoke burned the sessionStorage flag on the first mount while the
 * cleanup stripped the attribute, so on localhost it never played at all.
 *
 * It is now armed by a synchronous inline script in <head>, which is why
 * this asserts at DOMContentLoaded — before any React effect could run.
 */
test("intro is armed by the inline script, not after hydration", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const armed = await page.evaluate(() =>
    document.documentElement.getAttribute("data-intro"),
  );
  expect(armed, "data-intro must be set before React hydrates").toBe("run");

  const anim = await page
    .locator(".intro-line")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(anim).toBe("intro-slab");
});

test("intro does not replay on reload or on returning to the page", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html[data-intro]")).toHaveCount(0);

  await page.goto("/resume", { waitUntil: "domcontentloaded" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html[data-intro]")).toHaveCount(0);

  // And the hero is fully visible in both cases.
  const o = await page
    .locator(".intro-line")
    .first()
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(o).toBe("1");
});
