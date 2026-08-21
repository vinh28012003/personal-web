import { test, expect } from "@playwright/test";
import { PAGES, settle } from "./helpers";

for (const path of PAGES) {
  for (const width of [320, 375, 768, 1440]) {
    test(`no horizontal scroll at ${width}px — ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      await settle(page);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        scrollWidth,
        `overflow by ${scrollWidth - clientWidth}px`,
      ).toBeLessThanOrEqual(clientWidth);
    });
  }
}

/**
 * Regression: metric boxes were `w-44` fixed. The delta form
 * ("300ms -> 165ms") is wider than 11rem, and whitespace-nowrap pushed the
 * text straight through the right border. The heuristic audit did not catch
 * it; only a full-resolution screenshot did.
 */
test("metric content never overflows its own border", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await settle(page);

  const overflowing = await page.evaluate(() => {
    const bad: string[] = [];
    for (const box of document.querySelectorAll<HTMLElement>(
      ".border-2, .border-4",
    )) {
      const inner = box.querySelector<HTMLElement>(
        "span.inline-flex, span[aria-hidden='true']",
      );
      if (!inner || !box.querySelector(".font-mono")) continue;
      const b = box.getBoundingClientRect();
      const i = inner.getBoundingClientRect();
      const padRight = parseFloat(getComputedStyle(box).paddingRight);
      const slack = b.right - padRight - i.right;
      if (slack < 0)
        bad.push(
          `"${inner.textContent?.trim().slice(0, 20)}" overflows by ${Math.round(-slack)}px`,
        );
    }
    return bad;
  });

  expect(overflowing, overflowing.join("\n")).toEqual([]);
});

/**
 * Regression: Button hardcoded `text-ink`. Inside an inverted block `ink`
 * IS the background, so GitHub/LinkedIn rendered #0A0A0A on #0A0A0A — 1:1.
 */
test("no element renders text the same colour as its background", async ({
  page,
}) => {
  await page.goto("/");
  await settle(page);

  const invisible = await page.evaluate(() => {
    const bad: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(
      "a,button,span,p,h1,h2,h3",
    )) {
      const text = (el.textContent || "").trim();
      if (text.length < 2 || el.closest(".sr-only")) continue;
      const s = getComputedStyle(el);
      let n: HTMLElement | null = el;
      let bg = "";
      while (n) {
        const c = getComputedStyle(n).backgroundColor;
        if (c && c !== "rgba(0, 0, 0, 0)") {
          bg = c;
          break;
        }
        n = n.parentElement;
      }
      if (bg && s.color === bg)
        bad.push(`"${text.slice(0, 26)}" is ${s.color} on ${bg}`);
    }
    return bad;
  });

  expect(invisible, invisible.join("\n")).toEqual([]);
});

test("the whole project card is clickable, not just the title text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await settle(page);
  const card = page
    .locator("article")
    .filter({ hasText: "Redis Lite" })
    .first();
  await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!;
  // Far corner, nowhere near the <a> text.
  await page.mouse.click(box.x + box.width - 30, box.y + box.height - 20);
  await page.waitForURL("**/work/redis-lite");
});

test("touch targets meet 44px, excluding stretched-link titles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await settle(page);
  const small = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("a,button,[role=button]")]
      .filter((el) => {
        // A stretched link's real hit area is its positioned ancestor.
        if (el.className?.toString().includes("after:absolute")) return false;
        if (el.closest(".sr-only") || el.textContent?.match(/skip to content/i))
          return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
      })
      .map(
        (el) =>
          `${(el.textContent || "").trim().slice(0, 24)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`,
      ),
  );
  expect(small, small.join("\n")).toEqual([]);
});
