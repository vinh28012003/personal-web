/**
 * Runs synchronously in <head>, before first paint.
 *
 * Two jobs, both of which MUST happen before the browser paints:
 *
 * 1. Strip `no-js`. The reveal styles are scoped `html:not(.no-js)`, so if
 *    JavaScript never runs the class survives and nothing is ever hidden.
 *    That makes the no-JS path correct by construction.
 *
 * 2. Arm the first-visit intro. This deliberately is NOT a React effect.
 *    An effect runs after hydration (~400ms), so the hero would paint in
 *    its finished state and then visibly jump back to animate in. Worse,
 *    React StrictMode double-invokes effects in development: the first
 *    mount burned the sessionStorage flag, the cleanup removed the
 *    attribute, and the second mount then read the flag and bailed — so
 *    the intro never appeared at all on localhost.
 *
 * Failure is safe in both directions: if this script never runs, the hero
 * renders finished with nothing hidden; if it runs and the CSS animation
 * is interrupted, `animation-fill-mode: both` still leaves the end state.
 */
const BOOT = `
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('intro-played')) return;
    sessionStorage.setItem('intro-played', '1');
    d.setAttribute('data-intro', 'run');
    // Drop the hook once the longest line has finished, so a later client
    // navigation back to "/" cannot replay it mid-scroll.
    setTimeout(function () { d.removeAttribute('data-intro'); }, 1600);
  } catch (e) {
    /* storage blocked (private mode) — skip the intro, never the content */
  }
})()
`;

export function NoJsScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOT }} />;
}
