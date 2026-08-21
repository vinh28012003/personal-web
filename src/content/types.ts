/**
 * Content is typed TypeScript, not MDX. Two projects and five roles don't
 * justify an MDX pipeline, and typed objects let the metric components
 * enforce their own accessibility contract — `plain` is required, so a
 * metric physically cannot ship without its screen-reader sentence.
 */

export interface Metric {
  /** The figure itself, e.g. "375K". Ignored when this is a delta. */
  value: string;
  /** Small trailing unit rendered at 0.55em, e.g. "+". */
  suffix?: string;
  /** The label under the figure, e.g. "OPS/SEC". */
  unit: string;
  /** Delta form: before value, e.g. "500ms". */
  from?: string;
  /** Delta form: after value, e.g. "80ms". */
  to?: string;
  /** Full sentence for screen readers. Required — never optional. */
  plain: string;
}

export interface ProjectLinks {
  github?: string;
  npm?: string;
  pypi?: string;
  demo?: string;
}

export interface ProjectSection {
  heading: string;
  body: string[];
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  period: string;
  stack: readonly string[];
  /** Max 3 — the card layout breaks past three. */
  headlineMetrics: readonly Metric[];
  /** One sentence, used on the card. */
  hook: string;
  /**
   * Optional by design. The projects need more work before they're
   * linkable, so the deep-dive pages stand alone and the link row simply
   * doesn't render until a URL exists. Adding one later is a one-line
   * content edit with no layout change.
   */
  links?: ProjectLinks;
  /** Long-form narrative for the deep-dive page. */
  sections: readonly ProjectSection[];
}

export interface ExperienceBullet {
  text: string;
  metric?: Metric;
}

export interface Experience {
  org: string;
  role: string;
  location: string;
  start: string;
  end: string | "Present";
  /** ISO dates for the <time datetime> attributes. */
  startISO: string;
  endISO?: string;
  stack: readonly string[];
  bullets: readonly ExperienceBullet[];
}

export interface SkillGroup {
  label: string;
  items: readonly string[];
}

export interface Profile {
  name: string;
  role: string;
  school: string;
  graduation: string;
  email: string;
  github: string;
  linkedin: string;
  resumePath: string;
  /** The hero statement. Hard-broken into lines, never left to wrap. */
  heroLines: readonly string[];
  /**
   * Four phrases under the name, read left to right as a progression:
   * what he does, how he does it, then the tradeoff he actually made.
   */
  strapline: readonly string[];
}
