import type { Viewport } from "next";
import { Source_Serif_4 } from "next/font/google";
import { SkipLink } from "@/components/layout/skip-link";
import { BlogHeader } from "@/components/layout/blog-header";
import { BlogFooter } from "@/components/layout/blog-footer";

/**
 * The blog's shell.
 *
 * Not a route group: every blog URL already shares a /blog prefix, so this
 * file IS the shared layout. A group would only force app/(blog)/blog/.
 *
 * Two globals the portfolio mounts are deliberately absent here:
 *
 * SmoothAnchorScroll, because its same-document guard is written around the
 * portfolio's /#section shape. In a post the dominant link type is a footnote
 * ref (#fn-1), and a /blog/x#fn-1 click would pass a check it should fail and
 * get swallowed. It also force-closes dialog[open] on every anchor click,
 * which is mobile-nav behaviour with no meaning here. Native
 * scroll-behavior: smooth plus scroll-margin-top gives correct anchor
 * behaviour with zero JS and native focus handling.
 *
 * PageEnter, because it carries a GSAP transform for the length of its tween,
 * and a non-none transform on an ancestor flattens the 3D rendering context
 * that the Phase 2 index depends on. Keeping it off also keeps gsap out of
 * the blog bundle entirely.
 *
 * Standing invariant, and the reason to write it down while it is trivially
 * true: .blog must never carry transform, filter, opacity < 1,
 * backdrop-filter, contain: paint, or overflow: hidden. Each one flattens the
 * 3D context or creates a containing block. This will fail the day someone
 * adds overflow-x-hidden to fix an unrelated layout bug.
 */
const post = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext", "vietnamese"],
  /* wght always ships; opsz is the lever that keeps long-form calm. */
  axes: ["opsz"],
  /* Real italics, not synthesised obliques. */
  style: ["normal", "italic"],
  display: "swap",
});

/** Matches --blog-paper, so the browser chrome agrees with the page. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcf9" },
    { media: "(prefers-color-scheme: dark)", color: "#101113" },
  ],
};

export default function BlogLayout({ children }: LayoutProps<"/blog">) {
  return (
    <div
      className={`blog ${post.variable} flex min-h-dvh flex-1 flex-col`}
      /*
       * <main> lives in the layout, not the pages -- the opposite of the
       * portfolio's convention. Deliberate: MDX post bodies are generated
       * content and must not own the page landmark. A future
       * app/blog/tags/page.tsx that adds its own <main> would produce two
       * #main targets and break the skip link with no error, so blog.spec.ts
       * asserts there is exactly one.
       */
    >
      <SkipLink className="focus:border-2 focus:font-sans focus:normal-case" />
      <BlogHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <BlogFooter />
    </div>
  );
}
