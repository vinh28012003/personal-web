"use client";

import { useSyncExternalStore } from "react";

/** The value never changes after hydration, so nothing ever needs notifying. */
const subscribeNever = () => () => {};

/**
 * Reads a client-only value in a hydration-safe way.
 *
 * The usual `useState(false)` + `useEffect(() => setState(true))` dance does
 * the same job but triggers a cascading render, which React 19's
 * `react-hooks/set-state-in-effect` rule flags as an error. This is the
 * API actually designed for the problem: React renders `serverSnapshot`
 * during SSR and the first client pass, then swaps to `clientSnapshot`
 * without an extra render cycle.
 */
export function useClientValue<T>(clientSnapshot: () => T, serverSnapshot: () => T): T {
  return useSyncExternalStore(subscribeNever, clientSnapshot, serverSnapshot);
}

/** True once running on the client. Server and first paint both see false. */
export function useIsMounted(): boolean {
  return useClientValue(
    () => true,
    () => false,
  );
}
