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

  test("Escape closes it and returns focus to the trigger", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation menu/i }).click();
    await expect(page.locator("dialog")).toHaveAttribute("open", "");

    await page.keyboard.press("Escape");

    await expect(page.locator("dialog")).not.toHaveAttribute("open", "");

    // Closing is asynchronous: the dialog's close event sets state, React
    // re-renders, and only then does the effect cleanup restore overflow.
    // Reading synchronously here catches it mid-flight roughly one run in
    // three. The invariant is that it SETTLES released, not that it is
    // released the instant the key is pressed.
    await expect
      .poll(
        () => page.evaluate(() => document.documentElement.style.overflow),
        { timeout: 3000 },
      )
      .not.toBe("hidden");

    const label = await page.evaluate(
      () => document.activeElement?.getAttribute("aria-label") ?? "",
    );
    expect(label, "focus must return to the trigger").toMatch(
      /open navigation/i,
    );
  });

  test("a nav link closes the dialog and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation menu/i }).click();
    // Every link in the dialog is a same-page anchor now: the resume was
    // lifted out into the header bar so it is reachable without opening the
    // dialog at all. Anchor clicks are intercepted by SmoothAnchorScroll in
    // the capture phase, which is why closing has to happen there.
    await page
      .locator("dialog")
      .getByRole("link", { name: /^projects$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator("dialog")).toHaveCount(1);
    await expect(page.locator("dialog")).not.toHaveAttribute("open", "");
  });

  test("dialog links are not reachable by keyboard while closed", async ({
    page,
  }) => {
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
    // Light is the default, so the page opens light and the toggle moves to
    // dark first. enableSystem is off, so this holds regardless of the OS
    // preference the browser reports.
    await page.goto("/");
    await expect(page.locator("html.dark")).toHaveCount(0);

    await page.getByRole("button", { name: /switch to dark theme/i }).click();
    await expect(page.locator("html.dark")).toHaveCount(1);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "dark",
    );

    await page.reload();
    await expect(page.locator("html.dark")).toHaveCount(1);
  });

  test("switching back to light also persists", async ({ page }) => {
    // Seed once, not via addInitScript — that re-runs on every navigation
    // and would re-apply the value on the reload we are asserting against.
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    await expect(page.locator("html.dark")).toHaveCount(1);

    await page.getByRole("button", { name: /switch to light theme/i }).click();
    await expect(page.locator("html.dark")).toHaveCount(0);
    await page.reload();
    await expect(page.locator("html.dark")).toHaveCount(0);
  });

  test("has an accessible name before and after hydration", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const btn = page.getByRole("button", {
      name: /switch to .*theme|switch colour theme/i,
    });
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

  test("the mailto link is always present, independent of clipboard support", async ({
    page,
  }) => {
    await page.goto("/");
    const mailto = page.locator('a[href^="mailto:"]');
    await expect(mailto).toBeVisible();
    await expect(mailto).toHaveAttribute(
      "href",
      /tranquangvinh2801@gmail\.com/,
    );
  });
});

/* ── regressions from the code review ─────────────────────────────────── */

test("sticky header is never displaced during a route transition", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await page
    .getByRole("link", { name: /^resume$/i })
    .first()
    .click();

  // Sample across the whole tween window.
  const tops: number[] = [];
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(35);
    tops.push(
      await page.evaluate(() =>
        Math.round(
          document.querySelector("header")!.getBoundingClientRect().top,
        ),
      ),
    );
  }
  // The header lives outside PageEnter, so no transform can drag it.
  expect(
    tops.every((t) => t === 0),
    `header tops during tween: ${tops.join(",")}`,
  ).toBe(true);
});

test("resume viewer adapts when the viewport crosses the breakpoint", async ({
  page,
}) => {
  const embed = page.locator('object[type="application/pdf"]');
  const card = page.getByText(/inline pdf preview is unreliable/i);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/resume");
  await expect(embed).toBeHidden();
  await expect(card).toBeVisible();

  // Rotating a tablet used to leave this stuck on the mobile card forever.
  // CSS answers the width question every frame, so there is nothing to get
  // stuck: both branches are in the markup and only one is displayed.
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(embed).toBeVisible();
  await expect(card).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(embed).toBeHidden();
  await expect(card).toBeVisible();
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

/* ── section naming & the intro band ──────────────────────────────────── */

test("nav, headings and anchors all say Projects, Experiences and Toolkit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const nav = page.locator("header nav");
  await expect(nav.getByRole("link", { name: "Projects" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Experiences" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Toolkit" })).toBeVisible();
  await expect(nav.getByRole("link", { name: /^Work$/ })).toHaveCount(0);

  // The anchors the nav points at must exist, or the links go nowhere.
  await expect(page.locator("#projects")).toHaveCount(1);
  await expect(page.locator("#experiences")).toHaveCount(1);
  await expect(page.locator("#toolkit")).toHaveCount(1);
  await expect(page.locator("#work, #experience")).toHaveCount(0);
});

test("every in-page anchor link resolves to a real target", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="#"]')]
      .map((a) => (a as HTMLAnchorElement).getAttribute("href")!)
      .filter((h) => h.includes("#") && !h.startsWith("http")),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    const id = href.split("#")[1];
    if (!id) continue;
    await expect(page.locator(`#${id}`), `broken anchor: ${href}`).toHaveCount(
      1,
    );
  }
});

/**
 * The band under the hero used to show project metrics with no subject —
 * "10,219 RECORDS VERIFIED" reads as an orphan number to anyone who has not
 * yet seen the projects. Those figures belong to the project cards, which
 * name the system they came from.
 */
test("the intro band introduces the person, not project metrics", async ({
  page,
}) => {
  await page.goto("/");
  const band = page.locator('section[aria-label="At a glance"]');
  await expect(band).toBeVisible();

  const text = await band.innerText();
  expect(text).toMatch(/purdue/i);
  expect(text).toMatch(/backend/i);

  // Project figures must not appear above the Projects section.
  for (const figure of ["375K", "10,219", "SSE"]) {
    expect(text, `"${figure}" belongs in the Projects section`).not.toContain(
      figure,
    );
  }
});

test("project figures still appear inside the Projects section", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const section = page
    .locator("section")
    .filter({ has: page.locator("#projects") });
  const text = await section.innerText();
  expect(text).toContain("375K");
});

/* ── in-page anchor scrolling ─────────────────────────────────────────── */

test.describe("anchor scrolling", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const [label, id] of [
    ["Projects", "projects"],
    ["Experiences", "experiences"],
    ["Toolkit", "toolkit"],
    ["Contact", "contact"],
  ] as const) {
    test(`${label} scrolls smoothly and moves focus to the section`, async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => window.scrollTo(0, 0));

      await page
        .locator('header nav[aria-label="Primary"] a', { hasText: new RegExp(`^${label}$`) })
        .click();

      // Animated, not a jump: sample mid-flight and expect an intermediate
      // position rather than the destination immediately.
      await page.waitForTimeout(120);
      const mid = await page.evaluate(() => window.scrollY);
      expect(mid, "should be mid-scroll, not already arrived").toBeGreaterThan(0);

      await expect
        .poll(async () => page.evaluate(() => window.scrollY), { timeout: 4000 })
        .toBeGreaterThan(mid - 1);

      // Focus must follow the link, or the next Tab resumes from the nav.
      // Poll rather than guess a delay: focus is set when the animation
      // finishes, and the furthest section takes noticeably longer.
      await expect
        .poll(
          async () =>
            page.evaluate(
              (target) => document.activeElement === document.getElementById(target),
              id,
            ),
          { timeout: 4000 },
        )
        .toBe(true);
      expect(page.url()).toContain(`#${id}`);
    });
  }

  test("the section lands clear of the sticky header", async ({ page }) => {
    await page.goto("/");
    await page.locator('header nav[aria-label="Primary"] a', { hasText: /^Projects$/ }).click();
    await page.waitForTimeout(1200);
    const top = await page.evaluate(
      () => document.getElementById("projects")!.getBoundingClientRect().top,
    );
    const headerH = await page.evaluate(
      () => document.querySelector("header")!.getBoundingClientRect().height,
    );
    expect(top, "heading must not sit under the sticky header").toBeGreaterThanOrEqual(headerH);
  });

  test("a long scroll is not slower than a short one by much", async ({ page }) => {
    await page.goto("/");
    const time = async (label: string) => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      const t0 = Date.now();
      await page
        .locator('header nav[aria-label="Primary"] a', { hasText: new RegExp(`^${label}$`) })
        .click();
      let last = -1;
      let stable = 0;
      while (Date.now() - t0 < 4000) {
        await page.waitForTimeout(40);
        const y = await page.evaluate(() => Math.round(window.scrollY));
        if (y === last) {
          stable++;
          if (stable > 2) break;
        } else stable = 0;
        last = y;
      }
      return Date.now() - t0;
    };
    // Duration is clamped, so the furthest section must not take multiples
    // of the nearest. Native smooth scroll took ~1430ms for this one.
    expect(await time("Contact")).toBeLessThan(1800);
  });
});

test.describe("anchor scrolling with reduced motion", () => {
  test("jumps instantly rather than animating", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator('header nav[aria-label="Primary"] a', { hasText: /^Contact$/ }).click();
    await page.waitForTimeout(250);
    const y = await page.evaluate(() => window.scrollY);
    expect(y, "should already be at the section").toBeGreaterThan(1000);
  });
});

test("a link to another page still routes rather than scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/resume");
  await page.locator('header nav[aria-label="Primary"] a[href="/#projects"]').click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.locator("#projects")).toHaveCount(1);
});
