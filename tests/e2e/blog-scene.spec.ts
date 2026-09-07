import { test, expect, type Page } from "@playwright/test";
import { settle } from "./helpers";

/**
 * The arc: the scroll-driven 3D index at /blog.
 *
 * Kept apart from blog.spec.ts because the two have different lifetimes.
 * That file guards invariants that must hold for every blog route whatever
 * the index looks like. These are feature tests for one design and they die
 * with it -- a later redesign should delete this file whole.
 */

/**
 * Contrast, with alpha composited.
 *
 * helpers.ts's CONTRAST_FN cannot be used on this page. Its bgOf() walks up
 * for the first background whose alpha is not zero and treats it as OPAQUE,
 * which is right everywhere else on the site and wrong for glass: a 9% white
 * fill over near-black was scored as text on white and reported 1.06:1 for
 * panels that are plainly light on dark.
 *
 * This composites instead, folding every translucent layer onto the first
 * opaque one the way the compositor does. Kept local rather than changing the
 * shared helper, because a11y.spec.ts's results depend on that one's current
 * behaviour and this is the only page on the site with a translucent surface.
 */
const COMPOSITE_CONTRAST_FN = `
  (() => {
    const toRgb = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
      const p = m[1].split(',').map(parseFloat);
      return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
    const over = (top, bottom) => ({
      r: top.a * top.r + (1 - top.a) * bottom.r,
      g: top.a * top.g + (1 - top.a) * bottom.g,
      b: top.a * top.b + (1 - top.a) * bottom.b, a: 1 });
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const ratio = (a, b) => { const L1 = lum(a), L2 = lum(b);
      return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };
    const bgOf = (el) => {
      const stack = []; let n = el;
      while (n) {
        const c = toRgb(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; }
        n = n.parentElement;
      }
      let base = stack.length && stack[stack.length - 1].a === 1
        ? stack.pop() : { r: 255, g: 255, b: 255, a: 1 };
      for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
      return base;
    };
    return { toRgb, ratio, bgOf };
  })()
`;

/**
 * Scroll to a fraction of the track's travel and let a frame land.
 *
 * behavior:"instant" is required, not tidiness: globals.css sets
 * html { scroll-behavior: smooth }, so a plain scrollTo ANIMATES and every
 * measurement afterwards is taken mid-flight. The offset is resolved in the
 * page as rect.top + scrollY, NOT via boundingBox(), which is
 * viewport-relative and therefore wrong after the first scroll.
 */
async function scrubTo(page: Page, f: number) {
  await page.evaluate((fraction) => {
    const track = document.querySelector<HTMLElement>(".scene-track")!;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const travel = track.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: Math.round(top + travel * fraction),
      behavior: "instant",
    });
  }, f);
  await page.waitForTimeout(200);
}

const progress = (page: Page) =>
  page
    .locator(".scene")
    .evaluate((el) =>
      parseFloat(getComputedStyle(el).getPropertyValue("--scene-progress")),
    );

/**
 * One registered <number> is the only thing the listener writes for geometry.
 * The rail's rotation, every panel's place in the round and the floor all
 * derive from it. If it stops tracking, the page is a static arc and nothing
 * else would fail.
 */
test("scroll turns the arc, and progress clamps at both ends", async ({
  page,
}) => {
  await page.goto("/blog");

  await scrubTo(page, 0);
  expect(await progress(page)).toBeCloseTo(0, 1);
  const atStart = await page
    .locator(".arc-rail")
    .evaluate((el) => getComputedStyle(el).transform);

  await scrubTo(page, 0.5);
  const mid = await progress(page);
  expect(mid).toBeGreaterThan(0.4);
  expect(mid).toBeLessThan(0.6);
  const atMid = await page
    .locator(".arc-rail")
    .evaluate((el) => getComputedStyle(el).transform);
  // The rail actually turned, rather than progress moving with nothing bound.
  expect(atMid).not.toBe(atStart);

  await scrubTo(page, 1);
  expect(await progress(page)).toBeCloseTo(1, 1);

  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await page.waitForTimeout(200);
  expect(await progress(page)).toBeCloseTo(1, 1);
});

/**
 * Exactly one panel faces the reader, and it is the only one that can be
 * clicked. A correctness requirement, not a stylistic one: inside preserve-3d
 * a container filling the same space wins hit-testing, and a panel swung
 * behind the rail's own plane would swallow clicks meant for the front one.
 * That bug once made the entire index unclickable while looking perfect.
 */
test("exactly one panel is focused and takes pointer events", async ({
  page,
}) => {
  await page.goto("/blog");

  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    await scrubTo(page, f);
    const state = await page.evaluate(() => {
      const panels = [...document.querySelectorAll(".arc-panel")];
      return {
        total: panels.length,
        front: panels.filter((p) => p.hasAttribute("data-front")).length,
        clickable: panels.filter(
          (p) => getComputedStyle(p).pointerEvents !== "none",
        ).length,
        rail: getComputedStyle(document.querySelector(".arc-rail")!)
          .pointerEvents,
      };
    });
    expect(state.total, `at ${f}`).toBeGreaterThanOrEqual(5);
    expect(state.front, `at ${f}`).toBe(1);
    expect(state.clickable, `at ${f}`).toBe(1);
    expect(state.rail, `at ${f}`).toBe("none");
  }
});

/**
 * Turning the arc must move pixels, never layout. Everything is transform; if
 * a future change drives width or height off progress, every scroll frame
 * becomes a reflow. Same invariant motion.spec.ts holds for .slab-3d,
 * expressed as geometry because nothing here transitions at all.
 */
test("the arc animates no layout property", async ({ page }) => {
  await page.goto("/blog");

  const geometry = () =>
    page.evaluate(() => {
      const panel = document.querySelector<HTMLElement>(".arc-panel")!;
      const track = document.querySelector<HTMLElement>(".scene-track")!;
      const stage = document.querySelector<HTMLElement>(".scene")!;
      return [
        panel.offsetWidth,
        panel.offsetHeight,
        track.offsetHeight,
        stage.offsetHeight,
      ].join("/");
    });

  await scrubTo(page, 0.25);
  const early = await geometry();
  await scrubTo(page, 0.75);
  expect(await geometry()).toBe(early);
});

/**
 * The a11y sweep cannot see this page: settle() sets data-motion and the CSS
 * arm removes the whole track before a11y.spec.ts measures. Glass panels over
 * a deep ground are exactly where that blind spot would hurt, so contrast is
 * asserted here, at several rotations, with alpha composited.
 *
 * Both themes, even though the scene is deep in both: that is the claim being
 * tested. If someone later makes the arc theme-aware, this fails.
 */
for (const theme of ["light", "dark"] as const) {
  test(`panel text keeps AA at every rotation [${theme}]`, async ({ page }) => {
    if (theme === "dark")
      await page.addInitScript(() =>
        window.localStorage.setItem("theme", "dark"),
      );
    await page.goto("/blog");
    if (theme === "dark")
      await expect(page.locator("html.dark")).toHaveCount(1);

    const bad: string[] = [];
    for (const f of [0, 0.3, 0.5, 0.7, 1]) {
      await scrubTo(page, f);
      const failures: string[] = await page.evaluate((fnSrc) => {
        const { toRgb, ratio, bgOf } = eval(fnSrc);
        const out: string[] = [];
        const front = document.querySelector(".arc-panel[data-front]");
        if (!front) return ["no focused panel"];
        const nodes = front.querySelectorAll<HTMLElement>("h2, p, time");
        if (nodes.length === 0) return ["focused panel has no text"];
        for (const el of nodes) {
          const text = (el.textContent || "").trim();
          if (text.length < 2) continue;
          const s = getComputedStyle(el);
          const size = parseFloat(s.fontSize);
          const weight = parseInt(s.fontWeight) || 400;
          const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
          const cr = ratio(toRgb(s.color), bgOf(el));
          if (cr < need)
            out.push(`${cr.toFixed(2)}:1 (need ${need}) "${text.slice(0, 28)}"`);
        }
        return out;
      }, COMPOSITE_CONTRAST_FN);
      for (const one of failures) bad.push(`at progress ${f}: ${one}`);
    }
    expect(bad, bad.join("\n")).toEqual([]);
  });
}

/**
 * The chrome has to know what is behind it. The header is paper with dark ink
 * over the intro and would be a hard white band once the deep arc is behind
 * it, so it rebinds its own tokens while the arc is engaged. Both directions
 * matter: a header stranded dark after leaving the scene is worse than one
 * that never adapted.
 *
 * Polled, not sampled. The header transitions colour over 140ms and the
 * attribute lands on a rAF, so a single read right after scrolling catches a
 * value mid-tween -- measured at rgb(104, 104, 104) on the way to
 * rgb(240, 242, 246).
 */
test("the header adapts to the arc and reverts above it", async ({ page }) => {
  await page.goto("/blog");

  const wordmark = page.locator('header a[href="/"]');
  const colour = () => wordmark.evaluate((el) => getComputedStyle(el).color);
  const attr = () =>
    page.evaluate(() => document.documentElement.getAttribute("data-scene"));

  await scrubTo(page, 0.5);
  await expect.poll(attr).toBe("on");
  await expect.poll(colour, { timeout: 4000 }).toBe("rgb(240, 242, 246)");

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(attr).toBeNull();
  await expect.poll(colour, { timeout: 4000 }).toBe("rgb(28, 27, 25)");
});

/**
 * Every post is a real <a>, so the page is as crawlable and keyboard
 * navigable as a list. The far-corner click is the stretched link: the pane
 * is the hit area, the accessible name is the title alone.
 */
test("the focused panel is clickable at its far corner", async ({ page }) => {
  await page.goto("/blog");

  // Find a rotation whose focused panel is a post rather than a note.
  let href: string | null = null;
  for (const f of [0.25, 0.4, 0.5, 0.6]) {
    await scrubTo(page, f);
    const link = page.locator('.arc-panel[data-front] a[href^="/blog/"]');
    if ((await link.count()) === 1) {
      href = await link.getAttribute("href");
      break;
    }
  }
  expect(href, "no post panel was ever focused").not.toBeNull();

  const box = (await page
    .locator(".arc-panel[data-front] .arc-face")
    .boundingBox())!;
  await page.mouse.click(box.x + box.width - 20, box.y + box.height - 16);
  await page.waitForURL(`**${href}`);
});

/**
 * The note panels are what make an arc out of two posts, and they are only
 * defensible if they are true. Each points somewhere that exists.
 */
test("the note panels point where they claim to", async ({ page }) => {
  await page.goto("/blog");

  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLAnchorElement>(".arc-panel a")].map((a) =>
      a.getAttribute("href"),
    ),
  );
  expect(hrefs).toContain("/");
  expect(hrefs).toContain("#all-notes");
  await expect(page.locator("#all-notes")).toHaveCount(1);
});

test("the footer is hidden on the index and present on a post", async ({
  page,
}) => {
  await page.goto("/blog");
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.locator('header a[href="/"]')).toHaveCount(1);

  await page.goto("/blog/how-i-use-claude-code");
  await expect(page.locator("footer")).toBeVisible();
});

/**
 * A sticky, transformed scene is exactly the shape that traps a
 * position: fixed descendant, and the skip link is the only fixed element on
 * the site, applied on focus. It is a sibling of <main> and the scene lives
 * inside <main>, so this passes today; asserted because the day someone
 * hoists the scene it would fail silently.
 */
test("the arc does not trap the skip link", async ({ page }) => {
  await page.goto("/blog");
  await scrubTo(page, 0.5);
  await page.keyboard.press("Tab");

  const focused = page.locator(":focus");
  await expect(focused).toHaveText(/skip to content/i);
  const box = (await focused.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.height).toBeGreaterThan(20);
  expect(await focused.getAttribute("href")).toBe("#main");
});

/* -- the fallback is the index ----------------------------------------- */

/**
 * One arm, two triggers. Without JS a pinned arc is a frozen wall above a
 * screen-tall void; and data-motion="off" means render the finished state,
 * which for a journey is its destination. Both remove the track and leave the
 * quiet index, so the fallback is not a degraded copy of the page -- it IS
 * the page.
 */
test("the escape hatch collapses the arc to the readable index", async ({
  page,
}) => {
  await page.goto("/blog");
  await settle(page);

  const state = await page.evaluate(() => ({
    track: getComputedStyle(document.querySelector(".scene-track")!).display,
    scene: document.documentElement.getAttribute("data-scene"),
    h1: document.querySelectorAll("h1").length,
    titles: [...document.querySelectorAll("#all-notes h3")].map((h) =>
      (h.textContent || "").trim(),
    ),
    links: [
      ...document.querySelectorAll<HTMLAnchorElement>("#all-notes h3 a"),
    ].map((a) => a.getAttribute("href") || ""),
  }));

  expect(state.track).toBe("none");
  // The chrome must not be stranded dark with no arc behind it.
  expect(state.scene).toBeNull();
  expect(state.h1).toBe(1);
  expect(state.titles.length).toBeGreaterThan(0);
  expect(state.links.every((h) => h.startsWith("/blog/"))).toBe(true);
});

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("with no JS the index is an ordinary readable page", async ({
    page,
  }) => {
    await page.goto("/blog");

    await expect(page.locator("html.no-js")).toHaveCount(1);
    await expect(page.locator(".scene-track")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const links = page.locator('#all-notes h3 a[href^="/blog/"]');
    await expect(links).not.toHaveCount(0);
    await expect(links.first()).toBeVisible();
  });
});
