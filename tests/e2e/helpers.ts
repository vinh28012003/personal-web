import type { Page } from "@playwright/test";

export const PAGES = ["/", "/work/redis-lite", "/work/cforge"] as const;

/**
 * Force every reveal wrapper to its final state.
 *
 * Scroll-triggered reveals are correct for a human but invisible to a
 * non-scrolling capture, so invariant checks must assert against the
 * finished page, not the pre-scroll one.
 */
export async function settle(page: Page) {
  await page.evaluate(() =>
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => el.setAttribute("data-reveal", "in")),
  );
  await page.waitForTimeout(150);
}

/** WCAG relative luminance contrast between two computed colours. */
export const CONTRAST_FN = `
  (() => {
    const toRgb = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
      const p = m[1].split(',').map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const ratio = (a, b) => { const L1 = lum(a), L2 = lum(b);
      return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };
    const bgOf = (el) => { let n = el; while (n) {
      const c = toRgb(getComputedStyle(n).backgroundColor);
      if (c && c.a !== 0) return c; n = n.parentElement; }
      return { r: 255, g: 255, b: 255, a: 1 }; };
    return { toRgb, ratio, bgOf };
  })()
`;
