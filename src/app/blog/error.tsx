"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * The blog's error boundary, the sibling of app/blog/not-found.tsx.
 *
 * Without it an unhandled render error under /blog escapes to the root
 * boundary, which is written in the portfolio's voice and paints on the
 * portfolio's ground -- a brutalist slab dropped into a serif page.
 *
 * Structure is app/(portfolio)/error.tsx: a client component taking
 * { error, reset }, logging in an effect, and offering reset(). Markup and
 * tokens are not: those come from not-found.tsx, because this renders inside
 * the .blog scope.
 *
 * No <main> here, and this is the one difference from the portfolio's
 * error.tsx that matters. That file owns its landmark because the portfolio
 * layout renders none; app/blog/layout.tsx DOES render <main id="main">, so a
 * second one would give the page two #main targets and break the skip link
 * with no error. not-found.tsx carries the same note; blog.spec.ts asserts
 * exactly one #main per blog route.
 *
 * The button's border is --rule-strong, not --rule. Inside .blog, --rule is
 * a decorative hairline (1.37:1 light, 1.58:1 dark) and --rule-strong is the
 * one that clears the 3:1 a control boundary needs (3.58:1 / 3.54:1). The
 * focus ring is the global :focus-visible outline, and min-h-11 is the 44px
 * touch target layout.spec.ts checks.
 */
export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-24">
      <p className="text-post-meta uppercase text-muted">Error</p>
      <h1 className="mt-4 text-post-title">Something broke</h1>
      <p className="mt-5 max-w-[52ch] text-post-lede text-muted">
        This page failed to render. Trying again is often enough. If it is not,
        the rest of the writing is still where it was.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-post border border-rule-strong px-5 font-sans text-post-meta uppercase hover:bg-surface hover:text-accent-text"
        >
          Try again
        </button>
        <Link
          href="/blog"
          className="inline-flex min-h-11 items-center text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          All posts
        </Link>
      </div>
    </div>
  );
}
