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

/* ── sitemap completeness & canonical tags ────────────────────────────── */

/**
 * Regression: the sitemap was assembled inline as "home plus the projects",
 * so /resume — added later — silently never appeared. Nothing failed; the
 * list was just wrong. This asserts the sitemap covers every real route.
 */
test("sitemap contains every route the site actually serves", async ({ page, request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  const expected = ["/", "/resume", "/work/redis-lite", "/work/cforge"];
  for (const route of expected) {
    const hit = locs.some((l) => new URL(l).pathname === route);
    expect(hit, `sitemap is missing ${route}\nhas: ${locs.join(", ")}`).toBe(true);
  }
  // And nothing listed that 404s.
  for (const loc of locs) {
    const res = await page.goto(new URL(loc).pathname);
    expect(res?.status(), `sitemap lists ${loc} but it does not resolve`).toBe(200);
  }
});

/**
 * The project is reachable on its *.vercel.app alias as well as the custom
 * domain, and that alias serves 200 with no noindex. A canonical tag is what
 * stops the same content being indexed under two hostnames.
 */
test("every page emits a canonical pointing at its own path", async ({ page }) => {
  for (const route of ["/", "/resume", "/work/redis-lite", "/work/cforge"]) {
    await page.goto(route);
    const href = await page.getAttribute('link[rel="canonical"]', "href");
    expect(href, `no canonical on ${route}`).toBeTruthy();
    expect(new URL(href!).pathname, `wrong canonical on ${route}`).toBe(route);
  }
});

test("canonical uses the configured origin, not the request host", async ({ page }) => {
  await page.goto("/resume");
  const href = await page.getAttribute('link[rel="canonical"]', "href");
  const base = await page.getAttribute('meta[property="og:url"]', "content");
  // Both derive from SITE_URL, so their origins must agree.
  expect(new URL(href!).origin).toBe(new URL(base!).origin);
});
