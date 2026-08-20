import { test, expect } from "@playwright/test";

/* ── mobile nav ───────────────────────────────────────────────────────── */

test.describe("mobile nav", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps focus, and locks background scroll", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /open navigation menu/i });
    await trigger.click();

    const dialog = page.locator("dialog");
    await expect(dialog).toHaveAttribute("open", "");

    const state = await page.evaluate(() => ({
      focusInside: !!document.activeElement?.closest("dialog"),
      overflow: document.documentElement.style.overflow,
    }));
    expect(state.focusInside, "focus must move into the dialog").toBe(true);
    expect(state.overflow, "background scroll must be locked").toBe("hidden");
  });

  test("Escape closes it and returns focus to the trigger", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation menu/i }).click();
    await expect(page.locator("dialog")).toHaveAttribute("open", "");

    await page.keyboard.press("Escape");

    await expect(page.locator("dialog")).not.toHaveAttribute("open", "");
    const after = await page.evaluate(() => ({
      label: document.activeElement?.getAttribute("aria-label") ?? "",
      overflow: document.documentElement.style.overflow,
    }));
    expect(after.label, "focus must return to the trigger").toMatch(/open navigation/i);
    expect(after.overflow, "scroll lock must be released").not.toBe("hidden");
  });

  test("a nav link closes the dialog and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation menu/i }).click();
    await page.locator("dialog").getByRole("link", { name: /^résumé$/i }).first().click();
    await expect(page).toHaveURL(/\/resume$/);
    await expect(page.locator("dialog")).toHaveCount(1);
    await expect(page.locator("dialog")).not.toHaveAttribute("open", "");
  });

  test("dialog links are not reachable by keyboard while closed", async ({ page }) => {
    await page.goto("/");
    // A closed <dialog> is display:none, so nothing inside it may take focus.
    const reachable = await page.evaluate(() => {
      const d = document.querySelector("dialog");
      return [...(d?.querySelectorAll("a,button") ?? [])].some(
        (el) => (el as HTMLElement).offsetParent !== null,
      );
    });
    expect(reachable).toBe(false);
  });
});

/* ── theme toggle ─────────────────────────────────────────────────────── */

test.describe("theme toggle", () => {
  test("switches theme and persists across a reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html.dark")).toHaveCount(0);

    await page.getByRole("button", { name: /switch to dark theme/i }).click();
    await expect(page.locator("html.dark")).toHaveCount(1);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

    await page.reload();
    await expect(page.locator("html.dark")).toHaveCount(1);
  });

  test("switching back to light also persists", async ({ page }) => {
    // Seed once, not via addInitScript — that re-runs on every navigation
    // and would re-apply "dark" on the reload we are asserting against.
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    await expect(page.locator("html.dark")).toHaveCount(1);

    await page.getByRole("button", { name: /switch to light theme/i }).click();
    await expect(page.locator("html.dark")).toHaveCount(0);
    await page.reload();
    await expect(page.locator("html.dark")).toHaveCount(0);
  });

  test("has an accessible name before and after hydration", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const btn = page.getByRole("button", { name: /switch to .*theme|switch colour theme/i });
    await expect(btn).toBeVisible();
  });
});

/* ── copy email ───────────────────────────────────────────────────────── */

test.describe("copy email", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("copies the address and announces it", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByRole("button", { name: /copy email address/i });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe("tranquangvinh2801@gmail.com");

    // Politely announced, never a focus steal.
    const live = page.locator('output[aria-live="polite"]');
    await expect(live).toHaveText(/copied/i);
  });

  test("the mailto link is always present, independent of clipboard support", async ({ page }) => {
    await page.goto("/");
    const mailto = page.locator('a[href^="mailto:"]');
    await expect(mailto).toBeVisible();
    await expect(mailto).toHaveAttribute("href", /tranquangvinh2801@gmail\.com/);
  });
});

/* ── regressions from the code review ─────────────────────────────────── */

test("sticky header is never displaced during a route transition", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await page.getByRole("link", { name: /^résumé$/i }).first().click();

  // Sample across the whole tween window.
  const tops: number[] = [];
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(35);
    tops.push(
      await page.evaluate(() =>
        Math.round(document.querySelector("header")!.getBoundingClientRect().top),
      ),
    );
  }
  // The header lives outside PageEnter, so no transform can drag it.
  expect(tops.every((t) => t === 0), `header tops during tween: ${tops.join(",")}`).toBe(true);
});

test("resume viewer adapts when the viewport crosses the breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/resume");
  await expect(page.locator('object[type="application/pdf"]')).toHaveCount(0);

  // Rotating a tablet used to leave this stuck on the mobile card forever.
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('object[type="application/pdf"]')).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('object[type="application/pdf"]')).toHaveCount(0);
});

test("every page has a skip link, including 404", async ({ page }) => {
  for (const path of ["/", "/resume", "/work/redis-lite", "/work/nope"]) {
    await page.goto(path);
    await expect(
      page.getByRole("link", { name: /skip to content/i }),
      `missing skip link on ${path}`,
    ).toHaveCount(1);
  }
});
