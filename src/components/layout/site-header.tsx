import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileNav } from "./mobile-nav";

const NAV = [
  { href: "/#projects", label: "Projects" },
  { href: "/#experiences", label: "Experiences" },
  { href: "/#toolkit", label: "Toolkit" },
  { href: "/#contact", label: "Contact" },
] as const;

/**
 * Server Component. Navigation, plus the one action the site exists to cause.
 *
 * The resume used to sit here a second time, as an accent-filled button that
 * downloaded the PDF directly. Two controls one word apart pointed at two
 * different things, so it collapsed into a plain nav link to /resume.
 *
 * That over-corrected. As a nav link it read exactly like "Toolkit", and the
 * hero's primary leaves the viewport after about a screen and a half. On
 * mobile it also sat inside the dialog, so a phone visitor had no visible
 * path to the resume at all until they scrolled the whole page to Contact --
 * the site's stated goal, unreachable on the device most visitors arrive on.
 *
 * It is now a slab button, outside NAV and outside the dialog, visible at
 * every scroll position and width. Secondary rather than primary: the accent
 * already fills the hero button and both are on screen together at scroll 0,
 * where two accent slabs would read as two primaries.
 *
 * The direct PDF download still lives in Contact.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b-4 border-rule bg-paper">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:h-18 md:px-8">
        <Link
          href="/"
          // inline-flex + min-h-11 so the hit area clears 44px; without it
          // the link box is only as tall as the 12px label.
          className="inline-flex min-h-11 items-center px-2 font-mono text-label uppercase transition-none hover:bg-on-ground hover:text-ground"
        >
          Vinh Tran
        </Link>

        <div className="flex items-center gap-3">
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center px-3 font-mono text-label uppercase transition-none hover:bg-on-ground hover:text-ground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/*
            h-11 min-h-11 py-0 to line up with the toggle and menu trigger
            beside it. The variant's own 48px comes from padding plus border,
            so a bare h-11 loses to the base min-h-12 and the row sits
            misaligned. px-3 until sm keeps all four controls inside the
            gutters at 320px.
          */}
          <Button
            href="/resume"
            variant="secondary"
            className="h-11 min-h-11 px-3 py-0 sm:px-5"
          >
            Resume
          </Button>

          <ThemeToggle />

          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}
