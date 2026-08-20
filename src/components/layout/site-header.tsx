import Link from "next/link";
import { profile } from "@/content/profile";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileNav } from "./mobile-nav";
import { DownloadIcon } from "@/components/icons";

const NAV = [
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/resume", label: "Résumé" },
  { href: "/#contact", label: "Contact" },
] as const;

/**
 * Server Component. The résumé button is the single accent-filled element
 * on screen — the one primary CTA — and it is reachable at every viewport
 * without scrolling, which is the first thing a recruiter looks for.
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

          <ThemeToggle />

          {/*
            Visible at EVERY viewport. This is the one primary CTA and the
            first thing a recruiter looks for — burying it behind the mobile
            hamburger costs more than the header space it saves.
          */}
          <Button
            href={profile.resumePath}
            download
            variant="primary"
            className="px-3 md:px-5"
          >
            <DownloadIcon />
            Résumé
          </Button>

          <MobileNav items={NAV} resumeHref={profile.resumePath} />
        </div>
      </div>
    </header>
  );
}
