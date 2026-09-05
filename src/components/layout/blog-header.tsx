import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * The blog's chrome. Quieter than SiteHeader by design: a hairline rule
 * instead of a 4px slab, 60px instead of 64/72, no mobile dialog.
 *
 * The wordmark stays in Archivo, and it is the one deliberate thread back to
 * the portfolio. A blog that shares nothing with the site it hangs off reads
 * as a different person's work.
 *
 * ThemeToggle is reused unchanged. It resolves everything through --ground /
 * --on-ground, so the blog scope rebinds it for free.
 *
 * Sticky is safe here ONLY because this is a sibling of <main>, never a
 * descendant of it. position: sticky resolves against the nearest transformed
 * ancestor, so a header inside the Phase 2 scene would break.
 */
export function BlogHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper">
      <div className="mx-auto flex h-15 max-w-3xl items-center justify-between gap-4 px-5">
        <div className="flex items-baseline gap-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-sans text-post-meta uppercase hover:text-accent-text"
          >
            Vinh Tran
          </Link>
          <span aria-hidden="true" className="text-muted">
            /
          </span>
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center text-post-meta uppercase text-muted hover:text-accent-text"
          >
            Blog
          </Link>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
