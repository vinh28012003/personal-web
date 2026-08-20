"use client";

import { useEffect } from "react";

const KEY = "intro-played";

/**
 * Plays the 3D hero assembly once per session.
 *
 * The animation is opt-IN: the CSS only applies under `html[data-intro="run"]`,
 * which this component sets. So the default state — no JS, JS that failed,
 * reduced motion, or a repeat visit — is the finished hero with nothing
 * hidden. That is the opposite of the usual "hide, then reveal" pattern,
 * which strands content whenever the reveal never fires.
 *
 * Session, not local, storage: replaying on every visit for weeks is
 * tiresome, but a fresh session is a fresh first impression.
 */
export function HeroIntro() {
  useEffect(() => {
    const root = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let played = false;
    try {
      played = window.sessionStorage.getItem(KEY) === "1";
    } catch {
      // Private mode / storage blocked — treat as already played rather than
      // replaying the intro on every single navigation.
      played = true;
    }
    if (played) return;

    root.setAttribute("data-intro", "run");
    try {
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      /* storage unavailable; the attribute above still gates a single run */
    }

    // Remove the hook once the longest delay + duration has elapsed, so a
    // later client navigation back to "/" cannot retrigger it mid-scroll.
    const t = window.setTimeout(() => root.removeAttribute("data-intro"), 1600);
    return () => {
      window.clearTimeout(t);
      root.removeAttribute("data-intro");
    };
  }, []);

  return null;
}
