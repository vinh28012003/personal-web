/**
 * Strips `no-js` from <html> before first paint.
 *
 * The reveal styles are scoped `html:not(.no-js) [data-reveal="pending"]`, so
 * if JavaScript never runs the class survives and nothing is ever hidden.
 * That makes the no-JS path correct by construction rather than by fallback.
 *
 * This is a Server Component — the script is inlined into the HTML and runs
 * synchronously in <head>, so there is no flash of hidden content.
 */
export function NoJsScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.classList.remove('no-js')`,
      }}
    />
  );
}
