import { test, expect } from "@playwright/test";
import { PAGES, settle, CONTRAST_FN } from "./helpers";

for (const path of PAGES) {
  for (const theme of ["light", "dark"] as const) {
    test(`every text node meets WCAG AA — ${path} [${theme}]`, async ({ page }) => {
      if (theme === "dark")
        await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
      await page.goto(path);
      if (theme === "dark") await expect(page.locator("html.dark")).toHaveCount(1);
      await settle(page);

      const failures = await page.evaluate((fnSrc) => {
        const { toRgb, ratio, bgOf } = eval(fnSrc);
        const bad: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>(
          "p,span,a,li,h1,h2,h3,h4,button,dt,dd,time,s",
        )) {
          const own = [...el.childNodes]
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent!.trim())
            .join("");
          if (own.length < 2) continue;
          if (el.closest(".sr-only")) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const s = getComputedStyle(el);
          if (s.visibility === "hidden" || +s.opacity === 0) continue;
          const fg = toRgb(s.color);
          if (!fg) continue;
          const size = parseFloat(s.fontSize);
          const weight = parseInt(s.fontWeight) || 400;
          const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
          const cr = ratio(fg, bgOf(el));
          if (cr < need)
            bad.push(`${cr.toFixed(2)}:1 (need ${need}) "${own.slice(0, 32)}"`);
        }
        return bad;
      }, CONTRAST_FN);

      expect(failures, failures.join("\n")).toEqual([]);
    });
  }

  test(`every focusable shows a focus ring — ${path}`, async ({ page }) => {
    await page.goto(path);
    const missing: string[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const r = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        return {
          key:
            el.tagName +
            (el.getAttribute("aria-label") || "") +
            (el.textContent || "").trim().slice(0, 18),
          label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30),
          ok: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0,
        };
      });
      if (!r) continue;
      if (seen.has(r.key)) break;
      seen.add(r.key);
      if (!r.ok) missing.push(r.label);
    }

    // Mobile hides the desktop nav, so the count legitimately differs by
    // viewport. Assert the invariant that matters: every reachable control
    // has a ring, and the skip link is always reachable.
    expect(missing, `no focus ring on: ${missing.join(", ")}`).toEqual([]);
    expect([...seen].some((k) => /skip to content/i.test(k))).toBe(true);
  });

  test(`no emoji used as an icon — ${path}`, async ({ page }) => {
    await page.goto(path);
    await settle(page);
    const emoji = await page.evaluate(() =>
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(document.body.innerText),
    );
    expect(emoji).toBe(false);
  });
}

test("heading order has no skipped levels", async ({ page }) => {
  await page.goto("/");
  await settle(page);
  const levels = await page.evaluate(() =>
    [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]),
  );
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1], `at index ${i}: ${levels.join(",")}`).toBeLessThanOrEqual(1);
  }
});

test("zoom is never disabled", async ({ page }) => {
  await page.goto("/");
  const v = await page.getAttribute('meta[name="viewport"]', "content");
  expect(v).not.toMatch(/user-scalable\s*=\s*no/);
  expect(v).not.toMatch(/maximum-scale\s*=\s*1/);
});

test("skip link is the first tab stop and becomes visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveText(/skip to content/i);
  const box = await focused.boundingBox();
  expect(box!.height).toBeGreaterThan(20); // sr-only until focused, then real
});
