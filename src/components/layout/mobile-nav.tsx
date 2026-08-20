"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "@/components/icons";

interface MobileNavProps {
  items: readonly { href: string; label: string }[];
  resumeHref: string;
}

/**
 * Uses the native <dialog> element with showModal(), which gives a focus
 * trap, Escape-to-close, an inert background and ::backdrop for free — all
 * the things a hand-rolled modal gets wrong. No Radix, no headless-ui.
 */
export function MobileNav({ items, resumeHref }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Lock background scroll while the dialog is open.
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.style.overflow = "hidden";
      return () => {
        root.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="grid h-11 w-11 place-items-center border-2 border-rule text-lg transition-none hover:bg-on-ground hover:text-ground"
        aria-label="Open navigation menu"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        <MenuIcon />
      </button>

      <dialog
        ref={dialogRef}
        // `close` fires for Escape and for the close button alike, so focus
        // restoration and scroll unlock live in one place.
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink backdrop:bg-ink/70"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b-4 border-rule px-5">
            <span className="font-mono text-label uppercase">Menu</span>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center border-2 border-rule text-lg transition-none hover:bg-on-ground hover:text-ground"
              aria-label="Close navigation menu"
              onClick={close}
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex flex-col">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="border-b-2 border-rule px-5 py-5 text-h3 uppercase transition-none hover:bg-on-ground hover:text-ground"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={resumeHref}
              download
              onClick={close}
              className="border-b-2 border-rule bg-accent px-5 py-5 text-h3 uppercase text-accent-fg transition-none"
            >
              Résumé
            </a>
          </nav>
        </div>
      </dialog>
    </div>
  );
}
