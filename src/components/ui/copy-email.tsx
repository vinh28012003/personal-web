"use client";

import { useEffect, useRef, useState } from "react";
import { useClientValue } from "@/lib/use-client-value";
import { MailIcon, CopyIcon, CheckIcon } from "@/components/icons";

/**
 * The email is always a real mailto: link — the copy button is an addition,
 * never the only route. If the Clipboard API is unavailable the button
 * simply doesn't render.
 *
 * Feedback is a synchronous state swap: 0ms, no animation, which passes the
 * "feedback within 100ms" gate outright.
 *
 * A denied clipboard used to unmount the button. The control the user had
 * just pressed vanished, silently, dropping focus to <body> with nothing
 * announced and no way back short of a reload -- the page's only failure
 * path, and it failed by deleting itself. Denial is now a state the button
 * reports and recovers from: it stays mounted, says so, names the mailto
 * beside it, and a second press retries.
 */
export function CopyEmail({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Hydration-safe feature detection — false on the server and first paint.
  const hasClipboard = useClientValue(
    () => typeof navigator !== "undefined" && !!navigator.clipboard,
    () => false,
  );
  // Only feature detection gates rendering. A failure is a state, not a
  // reason to remove the control.
  const canCopy = hasClipboard;

  // The effect now only tears down; it sets no state.
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), 1600);
    } catch {
      // Denied or unavailable. The mailto: beside this always works, and a
      // second press retries in case the permission prompt was dismissed.
      setStatus("failed");
      timer.current = setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <a
        href={`mailto:${email}`}
        className="flex min-h-14 flex-1 items-center gap-3 border-4 border-rule px-5 font-mono text-sm break-all transition-none hover:bg-on-ground hover:text-ground sm:text-base"
      >
        <MailIcon className="shrink-0 text-lg" />
        {email}
      </a>

      {canCopy && (
        <button
          type="button"
          onClick={copy}
          className="flex min-h-14 min-w-14 items-center justify-center gap-2 border-4 border-rule px-5 font-mono text-label uppercase transition-none hover:bg-on-ground hover:text-ground active:translate-x-[3px] active:translate-y-[3px]"
        >
          {status === "copied" ? <CheckIcon /> : <CopyIcon />}
          <span aria-hidden="true">
            {status === "copied"
              ? "Copied"
              : status === "failed"
                ? "Use link"
                : "Copy"}
          </span>
          <span className="sr-only">
            {status === "copied"
              ? "Email address copied to clipboard"
              : status === "failed"
                ? "Copy failed. Use the email link beside this button, or press again to retry."
                : "Copy email address"}
          </span>
        </button>
      )}

      {/* Announced politely so it never steals focus mid-interaction. */}
      <output aria-live="polite" className="sr-only">
        {status === "copied"
          ? "Copied to clipboard"
          : status === "failed"
            ? "Copy failed. Use the email link instead."
            : ""}
      </output>
    </div>
  );
}
