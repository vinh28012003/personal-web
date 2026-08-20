"use client";

import { useCallback, useSyncExternalStore } from "react";

/** For values that cannot change after hydration — nothing to notify. */
const subscribeNever = () => () => {};

/**
 * Reads a client-only value in a hydration-safe way.
 *
 * The usual `useState(false)` + `useEffect(() => setState(true))` dance does
 * the same job but triggers a cascading render, which React 19's
 * `react-hooks/set-state-in-effect` rule flags as an error. This is the API
 * actually designed for the problem: React renders `serverSnapshot` during
 * SSR and the first client pass, then swaps to `clientSnapshot`.
 *
 * Use this only for values that are genuinely fixed for the session. For
 * anything that can change — viewport width, colour scheme — use
 * `useMediaQuery`, which subscribes to the change event.
 */
export function useClientValue<T>(
  clientSnapshot: () => T,
  serverSnapshot: () => T,
): T {
  return useSyncExternalStore(subscribeNever, clientSnapshot, serverSnapshot);
}

/** True once running on the client. Server and first paint both see false. */
export function useIsMounted(): boolean {
  return useClientValue(
    () => true,
    () => false,
  );
}

/**
 * Live media query. Re-renders when the match state changes.
 *
 * The earlier version of this read `matchMedia(...).matches` once through
 * `useClientValue`, which never subscribed — so resizing a window or
 * rotating a tablet left the component stuck on its initial answer.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    // Server has no viewport; render the "narrow" branch, which is the one
    // that degrades safely.
    () => false,
  );
}
