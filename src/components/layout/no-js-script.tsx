/**
 * Runs synchronously in <head>, before first paint.
 *
 * Two jobs, both of which MUST happen before the browser paints:
 *
 * 1. Strip `no-js`. The reveal styles are scoped `html:not(.no-js)`, so if
 *    JavaScript never runs the class survives and nothing is ever hidden.
 *    That makes the no-JS path correct by construction.
 *
 * 2. Arm the hero intro. This deliberately is NOT a React effect. An effect
 *    runs after hydration (~400ms), so the hero would paint in its finished
 *    state and then visibly jump back to animate in. React StrictMode also
 *    double-invokes effects in development, which is what stopped the intro
 *    appearing on localhost at all while production was fine.
 *
 * The intro plays on every full page load, refresh included. It is not
 * gated on storage: an earlier version ran once per session, which meant a
 * reload showed nothing and made the animation hard to see at all.
 *
 * A client-side navigation back to "/" does not replay it, because this
 * script only runs on a document load, and the attribute is dropped once
 * the animation has finished.
 *
 * Failure is safe in both directions: if this script never runs, the hero
 * renders finished with nothing hidden; if it runs and the CSS animation is
 * interrupted, `animation-fill-mode: both` still leaves the end state.
 */
const BOOT = `
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  d.setAttribute('data-intro', 'run');
  // Drop the hook once the longest line has finished, so a later client
  // navigation back to "/" cannot replay it mid-scroll.
  setTimeout(function () { d.removeAttribute('data-intro'); }, 1600);
})()
`;

export function NoJsScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOT }} />;
}
