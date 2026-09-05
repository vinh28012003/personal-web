import Link from "next/link";

/** One hairline, mono-ish label type, muted. The way back is the only job. */
export function BlogFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-sans text-post-meta uppercase text-muted hover:text-accent-text"
        >
          <span aria-hidden="true" className="mr-2">
            &larr;
          </span>
          Portfolio
        </Link>
        {/* font-sans, matching the header. The Archivo wordmark is the one
            deliberate thread back to the portfolio, so the same two words
            must not set in the serif at the other end of the page. */}
        <p className="font-sans text-post-meta uppercase text-muted">
          Vinh Tran
        </p>
      </div>
    </footer>
  );
}
