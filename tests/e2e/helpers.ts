import type { Page } from "@playwright/test";
import { allRoutes } from "../../src/lib/routes";

/**
 * One source, split by filter.
 *
 * Every list here is derived from allRoutes() -- the same function the sitemap
 * is built from. That is not tidiness. The previous shape kept PAGES as a
 * literal, and a literal is how coverage shrinks without failing: rename a
 * project and the sweeps below simply walk one route fewer, silently, while
 * staying green. The near-miss already on the record is the same shape -- a
 * hand-kept list that omitted /resume dropped it from three seo checks and
 * nothing went red, because every assertion in those loops is a subset check.
 *
 * Deriving PAGES also FIXED a live hole: /resume is in allRoutes() and was
 * never in the old literal, so it had never been through the WCAG AA sweep or
 * the four-width overflow sweep at all.
 */
const ALL = allRoutes().map((r) => r.path);

/** The portfolio's design language. */
export const PAGES = ALL.filter((p) => !p.startsWith("/blog"));

/**
 * The blog's. Kept separate because some expectations are portfolio-shaped;
 * everything in ALL_PAGES is a cross-design invariant that must hold in both.
 */
export const BLOG_PAGES = ALL.filter((p) => p.startsWith("/blog"));

export const ALL_PAGES = ALL;

/**
 * Force every reveal to its final state.
 *
 * Scroll-driven reveals are correct for a human but leave off-screen
 * elements at 0% progress, so invariant checks must assert against the
 * finished page rather than the pre-scroll one. `data-motion="off"` is the
 * production escape hatch that also covers print and non-scrolling capture.
 */
export async function settle(page: Page) {
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-motion", "off");
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => el.setAttribute("data-reveal", "in"));
  });
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
