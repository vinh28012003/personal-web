import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  /*
   * md/mdx are listed so @next/mdx registers its loader, but no .mdx file is
   * ever a route: post bodies live in src/content/posts, not src/app. The
   * consequence to know about is that a stray src/app/notes.md WOULD publish
   * itself as /notes.
   */
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

/*
 * Plugins are named by string, not imported.
 *
 * next build runs Turbopack by default in Next 16, and Turbopack hands loader
 * options across a Rust boundary: "remark and rehype plugins without
 * serializable options cannot be used yet with Turbopack, because JavaScript
 * functions can't be passed to Rust" (node_modules/next/dist/docs/01-app/
 * 02-guides/mdx.md). Everything below is JSON. The moment an option needs a
 * function -- rehype-pretty-code's `transformers`, say -- this stops working
 * and the build has to move to --webpack.
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      [
        "rehype-pretty-code",
        {
          /*
           * Two themes emitted at once as --shiki-light / --shiki-dark custom
           * properties, picked by CSS. Dark mode here is a class on <html>
           * written by next-themes before paint, so there is no second render
           * in which to choose a different theme.
           *
           * High-contrast variants, chosen by measurement rather than taste.
           * Every other bundled light theme fails WCAG AA against the code
           * background: the best non-contrast option was 4.15:1 and
           * github-light-default's comment grey (#6E7781) came in at 4.10:1,
           * which a11y.spec.ts caught. These are 4.55:1 and 8.13:1.
           *
           * Shiki emits token colours as inline custom properties with no
           * semantic class, so a failing comment colour cannot be patched in
           * CSS. The theme is the only lever.
           */
          theme: {
            light: "github-light-high-contrast",
            dark: "github-dark-high-contrast",
          },
          /*
           * The <pre> background comes from --surface. A theme background
           * would be the one colour on the page that isn't in the palette.
           */
          keepBackground: false,
          defaultLang: "plaintext",
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
