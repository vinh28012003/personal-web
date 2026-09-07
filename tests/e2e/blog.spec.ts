import { test, expect } from "@playwright/test";
import { BLOG_PAGES, PAGES, settle } from "./helpers";

/**
 * The blog's design language is a second theme living inside the same
 * document as the first. Everything here guards a claim that is currently
 * true, invisible in the markup, and cheap to break by accident.
 *
 * Two source files name this file as their proof:
 *   src/app/globals.css:251     -- "Do not tidy this into the block above."
 *   src/app/blog/layout.tsx:61  -- "blog.spec.ts asserts there is exactly one."
 *
 * The rest guards the preconditions of the CSS-3D index. Those preconditions
 * were previously written down in a session note and were wrong for weeks:
 * three tokens documented as "reserved for Phase 2" had been tree-shaken out
 * of every build, and nothing executable said so. A comment is not a
 * contract; a failing test is.
 */

/** #fdfcf9 / #101113, the two grounds .blog paints itself. */
const BLOG_PAPER = {
  light: { hex: "#fdfcf9", rgb: "rgb(253, 252, 249)" },
  dark: { hex: "#101113", rgb: "rgb(16, 17, 19)" },
} as const;

/* ==========================================================================
   1. TOKEN ISOLATION
   ========================================================================== */

for (const path of BLOG_PAGES) {
  for (const theme of ["light", "dark"] as const) {
    /**
     * The blog rebinds every semantic name the portfolio defines. Leaving one
     * inheriting means a portfolio primitive leaks into a reading surface
     * tuned around a different ground -- blaze #FF3B00 on warm paper, or the
     * portfolio's 4px structural rule under a paragraph.
     *
     * The body repaint is its own failure. <body> paints from :root, so a
     * descendant rebinding --paper leaves the document background and the
     * overscroll gutter portfolio-coloured while the article above it is
     * blog-coloured. globals.css:782 fixes that with `html:has(.blog) body`,
     * which is the only selector on the site that reaches upward and the
     * first thing a "tidy the selectors" pass deletes.
     */
    test(`blog tokens resolve to the blog's ground, not the portfolio's — ${path} [${theme}]`, async ({
      page,
    }) => {
      if (theme === "dark")
        await page.addInitScript(() =>
          window.localStorage.setItem("theme", "dark"),
        );
      await page.goto(path);
      if (theme === "dark")
        await expect(page.locator("html.dark")).toHaveCount(1);
      await settle(page);

      const result = await page.evaluate(() => {
        const scope = document.querySelector<HTMLElement>(".blog");
        if (!scope) return { error: "no .blog element on a blog route" };

        /* The set of names to check comes from the `.dark` rule, NOT from
           `.blog`. That is the whole point: a list read off .blog can only
           ever contain tokens .blog still redefines, so the one failure that
           matters -- a redefinition DELETED, leaving the portfolio's value to
           inherit through -- would remove itself from its own test. `.dark`
           is the independent definition of "a name the theme system swaps",
           and every name on it must be swapped here too. Reading it from the
           compiled sheet also means a token added to globals.css is covered
           without editing this file. */
        const declared: string[] = [];
        const walk = (rules: CSSRuleList) => {
          for (const rule of rules) {
            const grouping = rule as CSSRule & { cssRules?: CSSRuleList };
            if (grouping.cssRules) walk(grouping.cssRules);
            const style = rule as CSSStyleRule;
            if (style.selectorText !== ".dark") continue;
            for (const name of style.style)
              // --blog-* on .dark are the blog's own primitives, the SOURCE
              // the semantics below read from. Identical inside and out by
              // design.
              if (name.startsWith("--") && !name.startsWith("--blog-"))
                declared.push(name);
          }
        };
        for (const sheet of document.styleSheets) {
          try {
            walk(sheet.cssRules);
          } catch {
            /* cross-origin sheet; the app serves none */
          }
        }

        const root = getComputedStyle(document.documentElement);
        const blog = getComputedStyle(scope);
        const isColour = (v: string) => /^(#|rgb|hsl|oklch)/i.test(v.trim());

        /* A semantic name still carrying the portfolio's colour inside .blog
           is a leak by definition -- whether .blog set it to that value or
           never set it at all. */
        const leaked: string[] = [];
        for (const name of new Set(declared)) {
          const outside = root.getPropertyValue(name).trim();
          const inside = blog.getPropertyValue(name).trim();
          if (!isColour(outside)) continue; // structural token, not a ground
          if (outside === inside)
            leaked.push(`${name} is ${inside} both inside .blog and outside`);
        }

        return {
          checked: new Set(declared).size,
          paper: blog.getPropertyValue("--paper").trim(),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          scopeFont: blog.fontFamily,
          leaked,
        };
      });

      expect(result.error).toBeUndefined();
      // Guards against the sweep passing because it found nothing to sweep.
      // The portfolio's dark theme swaps 15 semantic names today.
      expect(result.checked!).toBeGreaterThanOrEqual(12);
      expect(result.leaked, result.leaked!.join("\n")).toEqual([]);
      expect(result.paper).toBe(BLOG_PAPER[theme].hex);
      expect(result.bodyBg).toBe(BLOG_PAPER[theme].rgb);
      expect(result.scopeFont).toMatch(/source.?serif/i);
      expect(result.scopeFont).not.toMatch(/archivo/i);
    });
  }
}

for (const path of PAGES) {
  /**
   * The other direction. `html:has(.blog) body` is a global rule keyed on a
   * class that a portfolio route never mounts; widen its selector by one
   * mistake and every portfolio page repaints onto the blog's warm paper
   * while its own tokens stay brutalist. Nothing else on the site would go
   * red, because every colour pair involved still clears WCAG AA.
   */
  test(`the blog's ground never reaches a portfolio route — ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await settle(page);

    const seen = await page.evaluate(() => ({
      blogScopes: document.querySelectorAll(".blog").length,
      paper: getComputedStyle(document.documentElement)
        .getPropertyValue("--paper")
        .trim(),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyFont: getComputedStyle(document.body).fontFamily,
    }));

    expect(seen.blogScopes).toBe(0);
    expect(seen.paper).toBe("#fafaf7");
    expect(seen.bodyBg).toBe("rgb(250, 250, 247)");
    expect(seen.bodyFont).toMatch(/archivo/i);
    expect(seen.bodyFont).not.toMatch(/source.?serif/i);
  });
}

/* ==========================================================================
   2. THE BLOG @theme BLOCK IS NOT `inline`
   ========================================================================== */

for (const path of BLOG_PAGES) {
  /**
   * globals.css:251 -- "Do not tidy this into the block above. blog.spec.ts
   * asserts it." This is that assertion.
   *
   * The portfolio's block is `@theme inline`, which compiles a utility to a
   * literal: `.text-h1{font-size:clamp(2.5rem,5.4vw,4.5rem)}`. No var(), so
   * no scope can rebind it. The blog's block is a plain `@theme`, which emits
   * both `:root{--text-post-title:...}` and a utility that READS it. That is
   * what will let the Phase 2 index shrink post type per card without
   * inventing a parallel scale.
   *
   * Adding `inline` is a one-word edit that looks like consistency, changes
   * no pixel on any page that exists today, and silently deletes the
   * capability. So the test is behavioural: rebind the custom property and
   * demand the rendered font-size follow. Under `inline` it cannot.
   */
  test(`post type stays rebindable, so its @theme block is not inline — ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await settle(page);

    const result = await page.evaluate(() => {
      const scope = document.querySelector<HTMLElement>(".blog");
      if (!scope) return { error: "no .blog element on a blog route" };

      /* Which text-post-* utilities Tailwind actually emitted -- read from
         the build, not from a list here. Tailwind tree-shakes a token no
         utility references, so the compiled sheet is the only honest source
         of what exists. */
      const utilities = new Set<string>();
      const walk = (rules: CSSRuleList) => {
        for (const rule of rules) {
          const grouping = rule as CSSRule & { cssRules?: CSSRuleList };
          if (grouping.cssRules) walk(grouping.cssRules);
          const selector = (rule as CSSStyleRule).selectorText;
          if (selector && /^\.text-post-[a-z0-9-]+$/.test(selector))
            utilities.add(selector.slice(1));
        }
      };
      for (const sheet of document.styleSheets) {
        try {
          walk(sheet.cssRules);
        } catch {
          /* cross-origin sheet; the app serves none */
        }
      }

      const wrap = document.createElement("div");
      scope.appendChild(wrap);
      const frozen: string[] = [];

      for (const utility of [...utilities].sort()) {
        const probe = document.createElement("span");
        probe.className = utility;
        probe.textContent = "rebind probe";
        wrap.appendChild(probe);

        const before = getComputedStyle(probe).fontSize;
        wrap.style.setProperty(`--${utility}`, "77px");
        const after = getComputedStyle(probe).fontSize;
        wrap.style.removeProperty(`--${utility}`);
        probe.remove();

        if (after !== "77px")
          frozen.push(
            `.${utility} ignored --${utility}: ${before} -> ${after}, expected 77px`,
          );
      }

      wrap.remove();
      return { found: [...utilities].sort(), frozen };
    });

    expect(result.error).toBeUndefined();
    // Vacuity guard: an empty utility set would make the sweep below pass.
    expect(
      result.found!.length,
      `found no text-post-* utilities at all: ${result.found}`,
    ).toBeGreaterThanOrEqual(3);
    expect(result.frozen, result.frozen!.join("\n")).toEqual([]);
  });
}

/* ==========================================================================
   3. THE 3D RENDERING CONTEXT
   ========================================================================== */

for (const path of BLOG_PAGES) {
  /**
   * blog/layout.tsx:29 writes this invariant down while it is trivially true,
   * and names how it dies: "This will fail the day someone adds
   * overflow-x-hidden to fix an unrelated layout bug."
   *
   * Each property below either flattens the 3D rendering context or turns
   * .blog into a containing block for fixed/absolute descendants. Both are
   * silent -- a flattened scene still renders, it just renders flat, and the
   * diff that caused it will be a one-class fix somewhere else entirely.
   */
  test(`.blog flattens nothing the 3D index will need — ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await settle(page);

    const bad = await page.evaluate(() => {
      const scope = document.querySelector<HTMLElement>(".blog");
      if (!scope) return ["no .blog element on a blog route"];
      const s = getComputedStyle(scope);
      const offenders: string[] = [];

      const mustBeNone = ["transform", "filter", "backdropFilter"] as const;
      for (const prop of mustBeNone)
        if (s[prop] !== "none") offenders.push(`${prop} is "${s[prop]}"`);

      if (s.opacity !== "1") offenders.push(`opacity is "${s.opacity}"`);
      if (/\bpaint\b/.test(s.contain))
        offenders.push(`contain is "${s.contain}"`);
      for (const prop of ["overflowX", "overflowY"] as const)
        if (s[prop] === "hidden") offenders.push(`${prop} is "hidden"`);

      return offenders;
    });

    expect(bad, bad.join("\n")).toEqual([]);
  });

  /**
   * PageEnter is deliberately absent from the blog shell (layout.tsx:24). It
   * holds a GSAP transform on an ancestor for the length of its tween, which
   * flattens the same context test above guards -- and it drags gsap into a
   * bundle whose whole point is that it ships no JS to read a post.
   *
   * The portfolio mounts exactly one, asserted in motion.spec.ts:10. Here the
   * correct count is zero, and "someone wrapped the blog in the shared shell
   * for consistency" is exactly the change that would not otherwise fail.
   */
  test(`no PageEnter transform on the ancestor chain — ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator("[data-page-enter]")).toHaveCount(0);
  });
}

/* ==========================================================================
   4. LANDMARKS
   ========================================================================== */

for (const path of BLOG_PAGES) {
  /**
   * blog/layout.tsx:61 -- <main> lives in the layout, not the pages, the
   * opposite of the portfolio's convention, because MDX post bodies are
   * generated content and must not own the page landmark. "A future
   * app/blog/tags/page.tsx that adds its own <main> would produce two #main
   * targets and break the skip link with no error, so blog.spec.ts asserts
   * there is exactly one."
   *
   * Duplicate ids are the failure with no symptom: the page renders, the skip
   * link still focuses something, and only the second landmark is unreachable.
   *
   * interactive.spec.ts:437-442 asserts .blog and #main on /blog/nope -- the
   * 404 boundary only. These are the real routes, and they grow with
   * BLOG_PAGES as posts are published.
   */
  test(`one blog shell, one main landmark, one h1 — ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator(".blog")).toHaveCount(1);
    await expect(page.locator("#main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}
