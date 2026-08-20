"use client";

import { useEffect } from "react";

export default function Error({
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
    <main id="main" className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-label uppercase text-muted">Error</p>
        <h1 className="mt-6 text-h1 uppercase">Something broke</h1>
        <p className="mt-6 max-w-[46ch] text-lead">
          An unexpected error occurred while rendering this page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-10 inline-flex min-h-14 items-center border-4 border-rule bg-accent px-7 font-mono text-sm font-bold uppercase tracking-[0.14em] text-accent-fg shadow-slab transition-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
