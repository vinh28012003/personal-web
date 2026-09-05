import Link from "next/link";

/** One hairline, mono-ish label type, muted. The way back is the only job. */
export function BlogFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-sans text-post-meta uppercase tracking-[0.06em] text-muted hover:text-accent-text"
        >
          <span aria-hidden="true" className="mr-2">
            &larr;
          </span>
          Portfolio
        </Link>
        <p className="text-post-meta uppercase tracking-[0.06em] text-muted">
          Vinh Tran
        </p>
      </div>
    </footer>
  );
}
