import { test, expect } from "@playwright/test";

test("sitemap lists every static route", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  for (const slug of ["redis-lite", "cforge"]) expect(xml).toContain(slug);
});

test("robots.txt points at the sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  expect(await res.text()).toMatch(/sitemap:/i);
});

test("open graph images render as PNG", async ({ request }) => {
  for (const url of ["/opengraph-image", "/work/redis-lite/opengraph-image"]) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    expect(res.headers()["content-type"], url).toContain("image/png");
  }
});

test("resume PDF is served for download", async ({ request }) => {
  const res = await request.get("/resume/vinh-tran-resume.pdf");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("pdf");
});

test("unknown project slug returns 404", async ({ page }) => {
  const res = await page.goto("/work/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("person structured data is valid JSON and names the school", async ({ page }) => {
  await page.goto("/");
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(raw!);
  expect(data["@type"]).toBe("Person");
  expect(data.alumniOf.name).toContain("Purdue");
});

test("the six recruiter-critical facts are present on the home page", async ({ page }) => {
  await page.goto("/");
  // Display type is uppercased in CSS, so innerText returns "REDIS LITE".
  const text = (await page.locator("body").innerText()).toLowerCase();
  for (const fact of ["Vinh", "Tran", "Purdue", "December 2025", "Redis Lite", "CForge"]) {
    expect(text, `missing: ${fact}`).toContain(fact.toLowerCase());
  }
  // The resume must be reachable without opening a menu or scrolling —
  // it is the primary CTA at every viewport.
  // The mobile nav <dialog> lives inside <header> and holds a second copy,
  // so exclude it — we want the always-visible one.
  await expect(
    page.locator('header a[href$=".pdf"]:not(dialog a)'),
  ).toBeVisible();
});
