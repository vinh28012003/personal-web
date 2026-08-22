import { test, expect } from "@playwright/test";

test("resume page is reachable from the primary nav", async ({ page }) => {
  await page.goto("/");
  const link = page.locator('header a[href="/resume"]:not(dialog a)');
  // Desktop shows it inline; mobile keeps it inside the menu dialog.
  if (await link.isVisible()) {
    await link.click();
    await expect(page).toHaveURL(/\/resume$/);
  } else {
    await page.goto("/resume");
  }
  await expect(
    page.getByRole("heading", { level: 1, name: /resume/i }),
  ).toBeVisible();
});

test("download and open-in-new-tab actions are always present", async ({
  page,
}) => {
  await page.goto("/resume");
  const dl = page.getByRole("link", { name: /download pdf/i });
  await expect(dl).toBeVisible();
  await expect(dl).toHaveAttribute("download", "");
  await expect(dl).toHaveAttribute("href", /\.pdf$/);
  await expect(
    page.getByRole("link", { name: /open in new tab/i }),
  ).toBeVisible();
});

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("embeds the PDF inline where it actually renders", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.locator('object[type="application/pdf"]')).toHaveCount(1);
  });
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows a real summary card instead of a broken PDF viewport", async ({
    page,
  }) => {
    await page.goto("/resume");
    // iOS Safari / Chrome Android render an embedded PDF as a blank box, so
    // it must not be mounted at all here.
    await expect(page.locator('object[type="application/pdf"]')).toHaveCount(0);
    await expect(page.getByText(/summary/i).first()).toBeVisible();
    await expect(page.getByText(/375K/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /download pdf/i }),
    ).toBeVisible();
  });
});

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("download still works without JS", async ({ page }) => {
    await page.goto("/resume");
    // The viewer is a client component, but the actions must survive.
    await expect(
      page.getByRole("heading", { level: 1, name: /resume/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /download pdf/i }),
    ).toBeVisible();
  });
});

/**
 * The hero's primary action previews rather than downloading. Handing a
 * recruiter a file they then have to open is worse than letting them read
 * it in place and decide.
 */
test("the hero resume button opens the preview page, not a download", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const btn = page.locator("main").getByRole("link", { name: /view resume/i });
  await expect(btn).toBeVisible();
  await expect(btn, "must navigate, not download").not.toHaveAttribute(
    "download",
    /.*/,
  );
  await expect(btn).toHaveAttribute("href", "/resume");

  await btn.click();
  await expect(page).toHaveURL(/\/resume$/);
  // And the download is waiting there.
  await expect(page.getByRole("link", { name: /download pdf/i })).toBeVisible();
});

/**
 * The header used to carry a download button one word away from a nav link
 * that went to the preview page instead: two controls, same label, different
 * destinations. The header now keeps only the link. The direct file download
 * survives in Contact and on /resume itself, so it is still two clicks at
 * worst, and this asserts both halves of that trade.
 */
test("the direct download moved out of the header and into contact", async ({
  page,
}) => {
  await page.goto("/");

  // Gone from the header at every viewport. No :not(dialog a) escape hatch
  // here on purpose: the mobile menu copy was removed too, so the whole
  // header subtree must be clear of PDF links.
  await expect(page.locator('header a[href$=".pdf"]')).toHaveCount(0);

  const contactBtn = page
    .locator("#contact-section")
    .locator('a[href$=".pdf"]');
  await expect(contactBtn).toHaveCount(1);
  await expect(contactBtn).toHaveAttribute("download", "");
});
