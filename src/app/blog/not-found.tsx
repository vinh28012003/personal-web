import Link from "next/link";

/**
 * The blog's 404.
 *
 * It renders inside app/blog/layout.tsx, so it inherits the .blog scope, the
 * serif and the blog chrome for free -- the opposite of the root
 * app/not-found.tsx, which sits ABOVE the (portfolio) group and has to call
 * PortfolioShell explicitly.
 *
 * This catches two things: notFound() thrown from blog/[slug]/page.tsx, and
 * an unmatched slug under dynamicParams = false, which never reaches the page
 * at all.
 *
 * No <main> here. The layout owns the landmark, so adding one would produce
 * two #main targets and break the skip link.
 */
export default function BlogNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24">
      <p className="text-post-meta uppercase tracking-[0.06em] text-muted">
        Error 404
      </p>
      <h1 className="mt-4 text-post-title">No such post</h1>
      <p className="mt-5 max-w-[52ch] text-post-lede text-muted">
        That post does not exist. It may have been renamed, or it may still be
        a draft.
      </p>
      <p className="mt-10">
        <Link
          href="/blog"
          className="text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          All posts
        </Link>
      </p>
    </div>
  );
}
