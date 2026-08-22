import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileNav } from "./mobile-nav";

const NAV = [
  { href: "/#projects", label: "Projects" },
  { href: "/#experiences", label: "Experiences" },
  { href: "/#toolkit", label: "Toolkit" },
  { href: "/resume", label: "Resume" },
  { href: "/#contact", label: "Contact" },
] as const;

/**
 * Server Component. The header carries navigation and nothing else.
 *
 * The resume used to sit here a second time, as an accent-filled button that
 * downloaded the PDF directly. Two controls one word apart pointed at two
 * different things, so it is now a single nav link to /resume, where the PDF
 * is previewed and can still be downloaded. The direct download survives in
 * Contact for anyone who wants the file without the detour.
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

          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}
