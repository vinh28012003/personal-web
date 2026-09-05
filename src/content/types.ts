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
}

/**
 * A closed set. A tag typo becomes a compile error rather than an orphan
 * filter page, and the union is what a future /blog/tag/[tag] route would
 * enumerate.
 */
export type PostTag =
  | "claude-code"
  | "data-structures"
  | "system-design"
  | "workflow";

export interface Post {
  slug: string;
  title: string;
  /**
   * ISO 8601 calendar date, YYYY-MM-DD.
   *
   * The first machine-readable date on this site. Experience has startISO,
   * but Project.period is the human string "January 2026 to February 2026"
   * with no counterpart, which is why the sitemap has never emitted a
   * lastModified. This one feeds four surfaces: <time datetime>, sitemap
   * lastModified, BlogPosting.datePublished, and the index sort.
   */
  published: string;
  /** Set only on a material revision. Drives BlogPosting.dateModified. */
  updated?: string;
  /** One or two sentences. Card copy, meta description, and BlogPosting.description. */
  excerpt: string;
  readonly tags: readonly PostTag[];
  /**
   * Excluded from the index, the sitemap, and generateStaticParams, so a
   * draft cannot be reached at its URL in production. Still importable in
   * dev, which is the point.
   */
  draft?: boolean;
}
