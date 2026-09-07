import { PortfolioShell } from "@/components/layout/portfolio-shell";

/**
 * The portfolio's chrome. Everything at /, /resume and /work/<slug>.
 *
 * This exists as a route group rather than a directory because those three
 * URLs are root-level and cannot otherwise share a non-root layout. The blog
 * needs no group: every blog URL already shares a /blog prefix, so
 * app/blog/layout.tsx is its shared layout for free.
 *
 * app/not-found.tsx deliberately does NOT render inside here -- Next wraps a
 * layout around the not-found of its own segment only, and unmatched URLs are
 * handled by the root one. That is why the chrome is a component: see
 * portfolio-shell.tsx.
 */
export default function PortfolioLayout({ children }: LayoutProps<"/">) {
  return <PortfolioShell>{children}</PortfolioShell>;
}
