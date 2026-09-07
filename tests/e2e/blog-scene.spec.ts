import { test, expect } from "@playwright/test";
import { settle, CONTRAST_FN } from "./helpers";

/**
 * The scene: the scroll-driven 3D narrative at /blog.
 *
 * Kept apart from blog.spec.ts because the two have different lifetimes.
 * That file guards invariants that must hold for every blog route whatever
 * the index looks like. These are feature tests for one design, and they
 * die with it -- a later redesign should delete this file whole.
 */

/**
 * Scroll to a fraction of the track's travel and let a frame land.
 *
 * The track's offset is resolved in the page, as rect.top + scrollY, NOT via
 * boundingBox(). boundingBox is viewport-relative, so once the page has been
 * scrolled once every later scrub aims at the wrong place -- 0.5 landed at
 * 0.29. It looked correct in a throwaway script only because that measured
 * the box once at the top and reused it.
 */
async function scrubTo(page: import("@playwright/test").Page, f: number) {
  await page.evaluate((fraction) => {
    const track = document.querySelector<HTMLElement>(".scene-track")!;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const travel = track.offsetHeight - window.innerHeight;
    /* behavior:"instant" is required, not tidiness. globals.css sets
       html { scroll-behavior: smooth }, so a plain scrollTo ANIMATES and
       every measurement afterwards is taken mid-flight -- 0.5 read as 0.39,
       and the click test missed a card that had not arrived yet. */
    window.scrollTo({ top: Math.round(top + travel * fraction), behavior: "instant" });
  }, f);
  await page.waitForTimeout(200);
}

const progress = (page: import("@playwright/test").Page) =>
  page
    .locator(".scene")
    .evaluate((el) =>
      parseFloat(getComputedStyle(el).getPropertyValue("--scene-progress")),
    );

/**
 * One registered <number> is the only thing the listener writes. Everything
 * else -- every card's depth, the ground colour, all three environment
 * layers -- is derived from it in calc(). If this stops tracking, the whole
 * page is static and nothing else would fail.
 */
test("scroll drives progress from 0 to 1 and clamps at both ends", async ({
  page,
}) => {
  await page.goto("/blog");

  await scrubTo(page, 0);
  expect(await progress(page)).toBeCloseTo(0, 1);

  await scrubTo(page, 0.5);
  const mid = await progress(page);
  expect(mid).toBeGreaterThan(0.4);
  expect(mid).toBeLessThan(0.6);

  await scrubTo(page, 1);
  expect(await progress(page)).toBeCloseTo(1, 1);

  // Past the end of the track it must stay pinned at 1, not keep counting.
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await page.waitForTimeout(180);
  expect(await progress(page)).toBeCloseTo(1, 1);
});

/**
 * Exactly one card is the subject at any moment -- that is what "let the
 * reader choose" means, and it is also a correctness requirement rather than
 * a stylistic one: an opacity:0 card that has flown past the camera still
 * covers the viewport and would swallow every click. Only [data-front] takes
 * pointer events, so if this count is ever 0 or 2 the page is either dead or
 * clicking the wrong post.
 */
test("exactly one card is the subject at every beat", async ({ page }) => {
  await page.goto("/blog");

  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    await scrubTo(page, f);
    const state = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".scene-card")];
      return {
        front: cards.filter((c) => c.hasAttribute("data-front")).length,
        clickable: cards.filter(
          (c) => getComputedStyle(c).pointerEvents !== "none",
        ).length,
        legible: cards.filter((c) => +getComputedStyle(c).opacity > 0.5).length,
      };
    });
    expect(state.front, `at ${f}`).toBe(1);
    expect(state.clickable, `at ${f}`).toBe(1);
    // Never two readable at once. The handoff is an empty beat, not a
    // crossfade -- the first attempt let both sit at 0.35 and the render
    // showed two sets of prose superimposed while every number looked fine.
    expect(state.legible, `at ${f}`).toBeLessThanOrEqual(1);
  }
});

/**
 * Scrolling must move pixels, never layout. Everything is transform and
 * opacity; if a future change drives width, height or margin off progress
 * instead, every scroll frame becomes a reflow. Same invariant motion.spec.ts
 * holds for the portfolio's .slab-3d, expressed as geometry rather than as
 * transition-property, because nothing here transitions at all.
 */
test("the scene animates no layout property", async ({ page }) => {
  await page.goto("/blog");

  const geometry = () =>
    page.evaluate(() => {
      const card = document.querySelector<HTMLElement>(".scene-card")!;
      const track = document.querySelector<HTMLElement>(".scene-track")!;
      const stage = document.querySelector<HTMLElement>(".scene")!;
      return [
        card.offsetWidth,
        card.offsetHeight,
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
 * The a11y sweep cannot see the scene: it calls settle(), which sets
 * data-motion and removes the track before measuring. So the ground travels
 * from paper to near-black entirely outside that check. Card text sits on an
 * opaque face for exactly this reason -- this asserts the face is really
 * doing its job at every point of the journey, in both themes.
 */
for (const theme of ["light", "dark"] as const) {
  test(`card text keeps AA against its face all the way down [${theme}]`, async ({
    page,
  }) => {
    if (theme === "dark")
      await page.addInitScript(() =>
        window.localStorage.setItem("theme", "dark"),
      );
    await page.goto("/blog");
    if (theme === "dark")
      await expect(page.locator("html.dark")).toHaveCount(1);

    const bad: string[] = [];
    for (const f of [0.15, 0.25, 0.5, 0.75, 0.9]) {
      await scrubTo(page, f);
      const failures = await page.evaluate((fnSrc) => {
        const { toRgb, ratio, bgOf } = eval(fnSrc);
        const out: string[] = [];
        const front = document.querySelector(".scene-card[data-front]");
        if (!front) return ["no front card"];
        for (const el of front.querySelectorAll<HTMLElement>("h2, p, time")) {
          const text = (el.textContent || "").trim();
          if (text.length < 2) continue;
          const s = getComputedStyle(el);
          const size = parseFloat(s.fontSize);
          const weight = parseInt(s.fontWeight) || 400;
          const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
          const cr = ratio(toRgb(s.color)!, bgOf(el));
          if (cr < need) out.push(`${cr.toFixed(2)}:1 "${text.slice(0, 28)}"`);
        }
        return out;
      }, CONTRAST_FN);
      for (const f2 of failures) bad.push(`at progress ${f}: ${f2}`);
    }
    expect(bad, bad.join("\n")).toEqual([]);
  });
}

/**
 * Every post is a real <a> in the markup, so the page is as crawlable and as
 * keyboard-navigable as a list. The far-corner click carries over the
 * meaning of the desk's stretched-link test: the card is the hit area, but
 * the accessible name is the title alone.
 */
test("the front card is clickable at its far corner", async ({ page }) => {
  await page.goto("/blog");
  await scrubTo(page, 0.25);

  const card = page.locator(".scene-card[data-front]");
  const link = card.getByRole("link");
  await expect(link).toHaveCount(1);
  const href = await link.getAttribute("href");

  const box = (await card.locator(".scene-card-face").boundingBox())!;
  await page.mouse.click(box.x + box.width - 22, box.y + box.height - 16);
  await page.waitForURL(`**${href}`);
});

/**
 * The footer's only link duplicates one the header already carries, so
 * hiding it on the index costs no navigation -- but it must NOT disappear
 * from the posts, where it is the way back.
 */
test("the footer is hidden on the index and present on a post", async ({
  page,
}) => {
  await page.goto("/blog");
  await expect(page.locator("footer")).toBeHidden();
  // The way out is still one click away.
  await expect(page.locator('header a[href="/"]')).toHaveCount(1);

  await page.goto("/blog/how-i-use-claude-code");
  await expect(page.locator("footer")).toBeVisible();
});

/**
 * A sticky, transformed scene is exactly the shape that traps a
 * position: fixed descendant -- and the skip link is the only fixed element
 * on the whole site, applied on focus. It is a sibling of <main> and the
 * scene lives inside <main>, so this passes today; it is asserted because
 * the day someone hoists the scene it would fail silently.
 */
test("the scene does not trap the skip link", async ({ page }) => {
  await page.goto("/blog");
  await scrubTo(page, 0.5);
  await page.keyboard.press("Tab");

  const focused = page.locator(":focus");
  await expect(focused).toHaveText(/skip to content/i);
  const box = (await focused.boundingBox())!;
  // Trapped inside the transformed scene it would be pushed off the top.
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.height).toBeGreaterThan(20);
  expect(await focused.getAttribute("href")).toBe("#main");
});

/* ── the fallback is the index ─────────────────────────────────────────── */

/**
 * One arm, two triggers. Without JS a pinned scene is not merely unanimated,
 * it is one stuck card above a screen-tall void; and data-motion="off" means
 * render the finished state, which for a narrative is its destination. Both
 * remove the track and leave the quiet index, so the fallback is not a
 * degraded copy of the page -- it IS the page.
 */
test("the escape hatch collapses the scene to the readable index", async ({
  page,
}) => {
  await page.goto("/blog");
  await settle(page);

  const state = await page.evaluate(() => ({
    track: getComputedStyle(document.querySelector(".scene-track")!).display,
    h1: document.querySelectorAll("h1").length,
    titles: [...document.querySelectorAll("h3")].map((h) =>
      (h.textContent || "").trim(),
    ),
    links: [...document.querySelectorAll<HTMLAnchorElement>("h3 a")].map(
      (a) => a.getAttribute("href") || "",
    ),
  }));

  expect(state.track).toBe("none");
  expect(state.h1).toBe(1);
  expect(state.titles.length).toBeGreaterThan(0);
  expect(state.titles.every((t) => t.length > 3)).toBe(true);
  expect(state.links.every((h) => h.startsWith("/blog/"))).toBe(true);
});

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("with no JS the index is an ordinary readable page", async ({
    page,
  }) => {
    await page.goto("/blog");

    // The boot script never ran, so html keeps its no-js class and the same
    // CSS arm applies.
    await expect(page.locator("html.no-js")).toHaveCount(1);
    await expect(page.locator(".scene-track")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const links = page.locator('h3 a[href^="/blog/"]');
    await expect(links).not.toHaveCount(0);
    await expect(links.first()).toBeVisible();
  });
});
