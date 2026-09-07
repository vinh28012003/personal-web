/**
 * The colours the OG cards paint with, and the CSS variable each one owes
 * its value to.
 *
 * ImageResponse renders outside the document. It has no stylesheet, no
 * cascade and no custom properties, so an OG card physically cannot read
 * --blog-paper -- the hex has to be literal. That part is unavoidable.
 *
 * What was avoidable is nobody noticing when the two drift. The hex used to
 * sit inline in two ~90-line components with a comment asking the next person
 * to keep it in step by hand, which is a promise, not a mechanism. Naming
 * each constant after the variable it mirrors turns the promise into
 * something og-palette.test.ts can check: it reads globals.css and asserts
 * every entry below still equals the declaration it claims to copy.
 *
 * Light values only, and deliberately. An OG card is a fixed image in a
 * link preview; there is no viewer preference to respond to and no media
 * query to respond with.
 */

/** Mirrors the --blog-* primitives. Used by the post card. */
export const BLOG_OG = {
  /** --blog-paper */
  paper: "#fdfcf9",
  /** --blog-ink */
  ink: "#1c1b19",
  /** --blog-muted */
  muted: "#5f5c56",
  /** --blog-accent */
  accent: "#2f4b7c",
} as const;

/** Mirrors the portfolio primitives. Used by the project card. */
export const PORTFOLIO_OG = {
  /** --primitive-paper-50 */
  paper: "#fafaf7",
  /** --primitive-ink-950 */
  ink: "#0a0a0a",
  /** --primitive-concrete-600 */
  muted: "#5e5e58",
} as const;

/**
 * The mapping the test enforces: constant -> the CSS custom property whose
 * :root value it must equal.
 *
 * Exported so the assertion cannot drift from the data either. Adding a
 * colour above without adding it here would leave it unchecked, so the test
 * also asserts every key of both palettes appears in this table.
 */
export const OG_TOKEN_SOURCE: Record<string, string> = {
  "BLOG_OG.paper": "--blog-paper",
  "BLOG_OG.ink": "--blog-ink",
  "BLOG_OG.muted": "--blog-muted",
  "BLOG_OG.accent": "--blog-accent",
  "PORTFOLIO_OG.paper": "--primitive-paper-50",
  "PORTFOLIO_OG.ink": "--primitive-ink-950",
  "PORTFOLIO_OG.muted": "--primitive-concrete-600",
};
