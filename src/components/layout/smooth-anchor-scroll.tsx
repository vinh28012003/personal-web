"use client";

import { useEffect } from "react";

/**
 * Takes over in-page anchor scrolling.
 *
 * Native `scroll-behavior: smooth` already works, but its duration scales
 * with distance: the jump from the hero to Contact measured ~1430ms, which
 * reads as sluggish. This clamps the duration so a long scroll and a short
 * one feel like the same gesture, and uses an ease-out so it arrives
 * settled rather than stopping dead.
 *
 * Two things it must not break, both of which native anchors give for free:
 *
 * - Focus. A keyboard user who activates a link expects focus to follow. We
 *   preventDefault, so focus has to be moved explicitly or the next Tab
 *   would resume from the nav rather than the section.
 * - The scroll offset. `scroll-margin-top` keeps the heading clear of the
 *   sticky header; a hand-rolled scroll has to read and subtract it.
 *
 * Under reduced motion it does nothing at all and lets the browser handle
 * the link, which is the correct instant jump.
 */
export function SmoothAnchorScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function scrollToTarget(el: HTMLElement) {
      const root = document.documentElement;
      // scroll-margin-top is what keeps the heading below the sticky header.
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      const start = window.scrollY;
      const end = Math.max(
        0,
        Math.min(
          el.getBoundingClientRect().top + start - margin,
          root.scrollHeight - window.innerHeight,
        ),
      );
      const distance = end - start;
      if (Math.abs(distance) < 2) return;

      // Long and short journeys should feel like the same gesture.
      const duration = Math.min(800, Math.max(420, Math.abs(distance) * 0.4));
      const startedAt = performance.now();

      // The CSS smooth behaviour would fight every frame we set.
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";

      cancelAnimationFrame(frame);
      const step = (now: number) => {
        const t = Math.min(1, (now - startedAt) / duration);
        window.scrollTo(0, start + distance * easeOutCubic(t));
        if (t < 1) {
          frame = requestAnimationFrame(step);
        } else {
          root.style.scrollBehavior = previous;
          // Move focus so the next Tab continues from the section, not the
          // nav. tabindex -1 makes a heading focusable without adding it to
          // the tab order.
          if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
          el.focus({ preventScroll: true });
        }
      };
      frame = requestAnimationFrame(step);
    }

    function onClick(event: MouseEvent) {
      if (prefersReduced.matches) return;
      // Let the browser handle modified clicks: new tab, download, etc.
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.includes("#")) return;

      const [path, hash] = href.split("#");
      if (!hash) return;
      // Only same-document links. A link to another page keeps the router.
      if (path && path !== "/" && path !== window.location.pathname) return;
      if (path === "/" && window.location.pathname !== "/") return;

      const target = document.getElementById(hash);
      if (!target) return;

      // Capture phase, so this runs before next/link's own handler and
      // before it can preventDefault for client-side routing. Stopping
      // propagation keeps the router from also navigating.
      event.preventDefault();
      event.stopPropagation();

      // That stopPropagation also kills React's synthetic click, which is
      // delegated at the root, so an onClick on the anchor itself never
      // runs. The mobile menu relied on exactly that to close itself, and
      // every link inside it is an in-page anchor -- so the page scrolled
      // behind a still-open full-screen dialog. Closing here is the only
      // place that still sees the event.
      document.querySelector<HTMLDialogElement>("dialog[open]")?.close();

      scrollToTarget(target);
      history.pushState(null, "", `#${hash}`);
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
