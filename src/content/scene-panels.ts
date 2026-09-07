import type { Post } from "./types";

/**
 * What sits on the arc.
 *
 * A union rather than a post array with special cases: the arc holds posts
 * AND a few real utility panels, and a `kind` discriminator is what keeps
 * "is this a post?" out of the rendering code as a truthiness check on some
 * optional field.
 *
 * The note panels exist because an arc of two panels is not an arc, and the
 * honest way to fill it is with things that are true rather than with
 * fabricated posts. Every one of these says something the site already says
 * elsewhere, or points somewhere that already exists.
 */
export type ScenePanel =
  | { kind: "post"; key: string; post: Post; placeholder?: true }
  | { kind: "note"; key: string; title: string; body: string; href?: string };

/** The blog's own published description, verbatim from the page metadata. */
const WHAT_THIS_IS =
  "Notes on how I work. Agent workflows, system design, data structures, and what I am building toward.";

/**
 * One opens the arc, two close it. Ordering matters: the reader meets a
 * statement of what this is, travels the posts, and lands on ways onward.
 */
export function openingPanels(): ScenePanel[] {
  return [
    {
      kind: "note",
      key: "what-this-is",
      title: "Notes",
      body: WHAT_THIS_IS,
    },
  ];
}

export function closingPanels(): ScenePanel[] {
  return [
    {
      kind: "note",
      key: "all-notes",
      title: "All notes",
      body: "Every post in one plain list, below.",
      href: "#all-notes",
    },
    {
      // The footer is hidden on this page, so this is the way back out.
      kind: "note",
      key: "portfolio",
      title: "Portfolio",
      body: "The work these notes come out of.",
      href: "/",
    },
  ];
}

/**
 * Posts in the middle, flanked by the notes.
 *
 * Placeholders are a SEPARATE argument, not concatenated by the caller, so
 * the flag that marks them cannot be lost on the way in. A fabricated post
 * that reads as real is the worst thing this site could ship; the panel
 * renders a badge and drops the link off the back of this flag.
 */
export function scenePanels(
  posts: readonly Post[],
  placeholders: readonly Post[] = [],
): ScenePanel[] {
  return [
    ...openingPanels(),
    ...posts.map<ScenePanel>((post) => ({
      kind: "post",
      key: post.slug,
      post,
    })),
    ...placeholders.map<ScenePanel>((post) => ({
      kind: "post",
      key: post.slug,
      post,
      placeholder: true,
    })),
    ...closingPanels(),
  ];
}
