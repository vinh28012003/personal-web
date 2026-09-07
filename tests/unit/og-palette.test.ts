import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { BLOG_OG, PORTFOLIO_OG, OG_TOKEN_SOURCE } from "@/lib/og-palette";

/**
 * An OG card cannot read a CSS custom property -- ImageResponse renders with
 * no document -- so its colours are literal hex that must track globals.css by
 * hand. This is the mechanism that replaces "by hand".
 *
 * Same technique posts.test.ts uses to keep the post manifest and the .mdx
 * files in step: read the other side off disk and compare. A comment asking
 * the next person to remember is not a mechanism.
 */

/** Every :root declaration in globals.css, as name -> value. */
async function rootCustomProperties(): Promise<Map<string, string>> {
  const css = await readFile(
    resolve(process.cwd(), "src/app/globals.css"),
    "utf8",
  );

  /*
   * Only :root blocks, and that scoping is the whole subtlety. --blog-paper is
   * declared twice: once at :root and again inside `.dark`. An OG card is a
   * fixed image in a link preview with no viewer preference to read, so the
   * light value is the correct one -- and a parser that took the last match
   * would silently compare against the dark palette instead.
   *
   * Safe to match blocks with a simple brace scan because every :root and
   * .dark block in this file is flat: custom properties only, no nested rules.
   * The test below fails loudly if that ever stops being true, because a
   * mis-parsed block loses the declarations it was supposed to find.
   */
  const props = new Map<string, string>();
  const blocks = [...css.matchAll(/^:root\s*\{([^}]*)\}/gm)];
  expect(blocks.length, "found no :root blocks in globals.css").toBeGreaterThan(
    0,
  );

  for (const [, body] of blocks) {
    for (const [, name, value] of body.matchAll(
      /(--[\w-]+)\s*:\s*([^;]+);/g,
    )) {
      // First declaration wins: later :root blocks in this file add tokens
      // rather than override earlier ones.
      if (!props.has(name)) props.set(name, value.trim());
    }
  }
  return props;
}

/** Flattened palettes, keyed the way OG_TOKEN_SOURCE names them. */
const ENTRIES = [
  ...Object.entries(BLOG_OG).map(([k, v]) => [`BLOG_OG.${k}`, v] as const),
  ...Object.entries(PORTFOLIO_OG).map(
    ([k, v]) => [`PORTFOLIO_OG.${k}`, v] as const,
  ),
];

describe("OG palette tracks globals.css", () => {
  it("should_match_the_css_variable_each_constant_mirrors", async () => {
    const props = await rootCustomProperties();

    for (const [key, hex] of ENTRIES) {
      const variable = OG_TOKEN_SOURCE[key];
      const declared = props.get(variable);

      expect(declared, `${variable} is not declared at :root`).toBeDefined();

      // Values carry trailing comments in this file, e.g. "#1c1b19; /* 16.77:1 */"
      // is split by the ";" above, but "#fdfcf9" may still arrive padded.
      expect(
        declared?.toLowerCase(),
        `${key} is ${hex} but ${variable} is ${declared}. ` +
          `An OG card cannot read the variable, so one of the two was edited alone.`,
      ).toBe(hex.toLowerCase());
    }
  });

  /**
   * Without this, adding a colour to a palette and forgetting OG_TOKEN_SOURCE
   * would leave it silently unchecked -- the loop above only walks what the
   * table names. Same subset-check trap that let /resume fall out of three
   * seo assertions while the suite stayed green.
   */
  it("should_name_a_source_variable_for_every_palette_entry", () => {
    for (const [key] of ENTRIES) {
      expect(
        OG_TOKEN_SOURCE[key],
        `${key} has no entry in OG_TOKEN_SOURCE, so nothing checks it`,
      ).toBeTruthy();
    }
  });

  it("should_not_name_variables_for_constants_that_no_longer_exist", () => {
    const keys = new Set<string>(ENTRIES.map(([k]) => k));
    for (const key of Object.keys(OG_TOKEN_SOURCE)) {
      expect(keys.has(key), `OG_TOKEN_SOURCE names ${key}, which is gone`).toBe(
        true,
      );
    }
  });
});
