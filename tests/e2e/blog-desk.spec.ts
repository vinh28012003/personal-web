import { test, expect } from "@playwright/test";
import { settle } from "./helpers";

/**
 * The desk: the CSS-3D index at /blog.
 *
 * Split from blog.spec.ts because the two files have different lifetimes.
 * That one guards invariants which must hold for every blog route whatever
 * the index looks like -- token isolation, landmarks, the rebindable type
 * scale. These are feature tests for one component, and they die with the
 * component. A Phase 3 redesign should be able to delete this file whole
 * and leave the invariants untouched.
 *
 * Two drivers are covered separately and each skips on the other project:
 * a fine pointer tracks the cursor, a coarse one tracks scroll. Both write
 * the same two properties on the plane.
 */

/**
 * One listener writes --tilt-x/--tilt-y on the PLANE and stops there. The
 * sheets are never touched; their own translateZ turns that single rotation
 * into parallax through the shared perspective. If a later change starts
 * writing per-sheet transforms, the mechanism has been rebuilt as something
 * more expensive that looks the same at rest.
 */
test("the desk tilts toward the pointer and returns to rest", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "needs a fine pointer");
  /* Desktop Chrome is 1280x720 and the desk bottom sits near 800px, so a
     pointer target computed as a fraction of the DESK lands below the window
     and dispatches nothing. Size the viewport to the desk, not the other way
     round. */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/blog");

  const plane = page.locator(".post-desk-plane");
  const tilt = () =>
    plane.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        x: s.getPropertyValue("--tilt-x").trim(),
        y: s.getPropertyValue("--tilt-y").trim(),
      };
    });

  // Server-rendered state is flat: the properties sit at their @property
  // initial-value until the effect runs. That is also the no-JS state.
  expect(await tilt()).toEqual({ x: "0deg", y: "0deg" });

  const box = (await page.locator(".post-desk").boundingBox())!;

  /* The listener attaches in an effect, so it does not exist at `load` --
     when page.goto() resolves. A single mouse.move() here fires into a page
     with no listener and polling afterwards re-reads a property that nothing
     will ever update again. Move INSIDE the poll instead, jittered so each
     attempt is a distinct event. Async-assertion races are the recurring
     failure in this suite; suspect this shape first. */
  let n = 0;
  const nudge = async (fx: number, fy: number) => {
    n += 1;
    await page.mouse.move(
      box.x + box.width * fx + (n % 3),
      box.y + box.height * fy + (n % 3),
      { steps: 2 },
    );
    return tilt();
  };

  await expect.poll(async () => (await nudge(0.9, 0.85)).y).not.toBe("0deg");
  const low = await tilt();
  await expect.poll(async () => (await nudge(0.1, 0.15)).y).not.toBe(low.y);

  // Opposite corner, opposite sign. A one-directional drift would pass a
  // "did it move" check and still be wrong.
  const high = await tilt();
  expect(parseFloat(high.x)).toBeCloseTo(-parseFloat(low.x), 1);
  expect(parseFloat(high.y)).toBeCloseTo(-parseFloat(low.y), 1);
});

/**
 * The other half of the interaction, and it had no coverage at all: the
 * desktop tilt test is fine-pointer only, so on a phone nothing asserted
 * that the desk responded to anything.
 *
 * A coarse pointer has no cursor to track, so scroll position drives the
 * lean instead. Both drivers write the SAME two properties on the plane --
 * that is the point of the design, one stylesheet and two drivers -- so if
 * this ever stops moving, the mobile half of the page has silently become a
 * static list while every other test still passes.
 */
test("scroll drives the lean where there is no pointer", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "needs a coarse pointer");
  await page.goto("/blog");

  const tiltX = () =>
    page
      .locator(".post-desk-plane")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--tilt-x").trim());

  // The resting lean depends on where the desk already sits, so it is set
  // once at mount rather than waiting for a first scroll event.
  await expect.poll(tiltX).not.toBe("0deg");
  const atLoad = await tiltX();

  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollBy(0, 260));
      return tiltX();
    })
    .not.toBe(atLoad);
});

/**
 * Regression, caught by reading this file rather than by a failure: the first
 * version of the escape hatch flattened the sheets as well as the plane.
 * settle() runs before every geometry read in layout.spec.ts, so that would
 * have measured the 320px overflow sweep against a page that never ships and
 * hidden rotation-induced overflow on the width where it is most likely.
 *
 * A sheet's rotation and lift are its FINISHED state, and "off" means render
 * the finished state. Only the pointer-driven plane is motion.
 */
test("the escape hatch flattens the plane and keeps each sheet's lift", async ({
  page,
}) => {
  await page.goto("/blog");
  await settle(page);

  const state = await page.evaluate(() => ({
    plane: getComputedStyle(document.querySelector(".post-desk-plane")!)
      .transform,
    sheets: [...document.querySelectorAll(".post-sheet")].map(
      (el) => getComputedStyle(el).transform,
    ),
  }));

  expect(state.plane).toBe("none");
  expect(state.sheets.length).toBeGreaterThan(0);
  expect(
    state.sheets.filter((t) => t === "none"),
    `sheets flattened by data-motion: ${state.sheets.join(" | ")}`,
  ).toEqual([]);
});

/**
 * The sheet is the hit area, not the title text. Aiming at a rotated line of
 * serif is unpleasant, and the accessible name still has to be the title
 * alone -- wrapping the sheet in an <a> would read the date and the whole
 * excerpt as the link label.
 */
test("a sheet is clickable at its far corner, not just the title", async ({
  page,
}) => {
  await page.goto("/blog");
  await settle(page);

  const sheet = page.locator(".post-sheet").first();
  const link = sheet.getByRole("link");
  await expect(link).toHaveCount(1);
  const href = await link.getAttribute("href");

  const box = (await sheet.boundingBox())!;
  await page.mouse.click(box.x + box.width - 24, box.y + box.height - 18);
  await page.waitForURL(`**${href}`);
});

/**
 * Sheets overlap into each other's PADDING band only. Occlusion is the depth
 * cue; occluded prose is just a bug. Tightening the padding or widening the
 * overlap without checking the pair is how the excerpt gets covered.
 */
test("sheets overlap into padding, never over text", async ({ page }) => {
  await page.goto("/blog");
  await settle(page);

  const result = await page.evaluate(() => {
    const offenders: string[] = [];
    const sheets = [...document.querySelectorAll<HTMLElement>(".post-sheet")];
    for (const el of sheets.slice(1)) {
      const s = getComputedStyle(el);
      const overlap = -parseFloat(s.marginBlockStart);
      const padTop = parseFloat(s.paddingTop);
      const padBottom = parseFloat(getComputedStyle(sheets[0]).paddingBottom);
      if (overlap > Math.min(padTop, padBottom))
        offenders.push(
          `overlap ${overlap}px exceeds the ${Math.min(padTop, padBottom)}px padding band`,
        );
    }
    return { offenders, pairs: Math.max(0, sheets.length - 1) };
  });

  /* Vacuity guard: slice(1) is empty at one sheet, so without this the
     assertion holds against nothing -- the same shape that let a test named
     "the six facts" check five. */
  expect(result.pairs, "no overlapping pair to check").toBeGreaterThan(0);
  expect(result.offenders, result.offenders.join("\n")).toEqual([]);
});

/**
 * The desk animates transform and box-shadow only. Transitioning a layout
 * property would cause thrash and CLS on every pointer move -- the same
 * invariant motion.spec.ts:96 holds for the portfolio's .slab-3d.
 */
test("the desk animates no layout property", async ({ page }) => {
  await page.goto("/blog");

  /* Polled, not read once. next-themes runs with disableTransitionOnChange,
     which injects a global `* { transition: none !important }` while it
     applies the theme class and strips it a frame later. Reading
     transitionProperty the instant goto() resolves lands inside that window
     and reports "none" for every element on the page. Measured: "none" at
     0ms on a cold read, "transform" by 120ms.

     settle() is not the fix here -- it sets data-motion="off", which is
     exactly the rule that suppresses the plane's transition on purpose. */
  const prop = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => getComputedStyle(el).transitionProperty);

  await expect.poll(() => prop(".post-desk-plane")).toBe("transform");
  await expect.poll(() => prop(".post-sheet")).toBe("box-shadow");
});

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  /**
   * The blog relaxes the site-wide "no JS renders the finished state" rule --
   * it is the playground, and that was an explicit call. What must NOT happen
   * is content stranded invisible. With no JS the desk simply sits flat: the
   * sheets keep their lift, every title is present, and every link works.
   */
  test("the desk is a readable page with no JS at all", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.locator(".post-sheet")).not.toHaveCount(0);
    const sheets = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".post-sheet")].map((el) => ({
        opacity: getComputedStyle(el).opacity,
        transform: getComputedStyle(el).transform,
        text: (el.textContent || "").trim().length,
      })),
    );
    for (const s of sheets) {
      expect(s.opacity).toBe("1");
      expect(s.transform).not.toBe("none");
      expect(s.text).toBeGreaterThan(40);
    }

    // The plane never tilts, because the effect that would tilt it never ran.
    const plane = await page
      .locator(".post-desk-plane")
      .evaluate((el) => getComputedStyle(el).transform);
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(plane);
  });
});

test.describe("prefers-reduced-motion", () => {
  /**
   * Two claims at once, and they pull in opposite directions.
   *
   * The blog deliberately keeps the desk live under reduced motion -- it is
   * the playground and that was an explicit call. Because the site-wide
   * reduce block already forces transition-duration:.01ms on EVERY element,
   * honouring that choice meant ADDING an override, not omitting a guard.
   * Delete it and the tilt still tracks but snaps, which is jumpier than
   * either extreme.
   *
   * data-motion="off" must still win over that override, or the harness
   * cannot flatten the desk on a machine with reduced motion enabled and
   * every geometry measurement there is taken mid-transform.
   *
   * The precedence is a cascade-layer subtlety, not an accident: !important
   * in unlayered styles ranks BELOW !important in any layer, so the arm in
   * @layer utilities beats the unlayered reduce override. Verified in a
   * browser rather than inferred, because inferred CSS behaviour is how
   * three "reserved" tokens stayed in the notes while absent from the build.
   */
  test("the desk stays live under reduced motion, and the escape hatch still wins", async ({
    page,
  }) => {
    // emulateMedia, not test.use({ reducedMotion }) -- matches motion.spec.ts
    // and is what this version of @playwright/test actually types.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/blog");

    const plane = page.locator(".post-desk-plane");
    const read = () =>
      plane.evaluate((el) => {
        const s = getComputedStyle(el);
        return { dur: s.transitionDuration, transform: s.transform };
      });

    // The relaxation: not clamped to the site-wide 0.01ms.
    await expect.poll(async () => (await read()).dur).toBe("0.14s");

    await page.evaluate(() =>
      document.documentElement.setAttribute("data-motion", "off"),
    );

    await expect.poll(async () => (await read()).transform).toBe("none");
    expect((await read()).dur).toBe("0s");
  });
});
