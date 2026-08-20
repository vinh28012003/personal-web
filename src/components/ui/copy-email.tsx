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
 */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [denied, setDenied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Hydration-safe feature detection — false on the server and first paint.
  const hasClipboard = useClientValue(
    () => typeof navigator !== "undefined" && !!navigator.clipboard,
    () => false,
  );
  const canCopy = hasClipboard && !denied;

  // The effect now only tears down; it sets no state.
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard denied — the mailto: link beside this still works.
      setDenied(true);
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
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
          <span className="sr-only">
            {copied ? "Email address copied to clipboard" : "Copy email address"}
          </span>
        </button>
      )}

      {/* Announced politely so it never steals focus mid-interaction. */}
      <output aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </output>
    </div>
  );
}
