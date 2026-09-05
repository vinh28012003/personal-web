import type { MDXComponents } from "mdx/types";
import { PostLink } from "@/components/blog/post-link";
import { Figure } from "@/components/blog/figure";

/*
 * Required by @next/mdx. Without this file the App Router integration does
 * nothing at all, and it fails silently rather than erroring.
 *
 * The signature takes NO arguments. That is a breaking change in Next 16:
 * the Next 15 form was useMDXComponents(components) and merged what it was
 * handed, so most examples in the wild are wrong here.
 *
 * The container in blog/[slug]/page.tsx is `flex flex-col gap-5`, so every
 * block below is a flex child and inherits the vertical rhythm for free.
 * That is why `p` needs no mapping: only headings break the rhythm upward.
 */
const components: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-8 text-post-h2 scroll-mt-[calc(var(--header-h)+1rem)]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 text-post-h3 scroll-mt-[calc(var(--header-h)+1rem)]">
      {children}
    </h3>
  ),

  a: PostLink,

  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-2 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="flex list-decimal flex-col gap-2 pl-6">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,

  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-rule-strong pl-5 text-muted italic">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="my-6 border-t border-rule" />,

  /*
   * Inline code only. Fenced blocks are wrapped by rehype-pretty-code in
   * <figure data-rehype-pretty-code-figure><pre><code>, generated AFTER this
   * mapping runs, so their styling lives in globals.css instead. Verified in
   * the built HTML, not assumed.
   */
  code: ({ children, ...rest }) => (
    <code
      {...rest}
      className="font-mono text-[0.875em] rounded-post border border-rule bg-surface px-[0.3em] py-[0.1em]"
    >
      {children}
    </code>
  ),

  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-post-small">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-rule-strong px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-rule px-3 py-2 align-top">{children}</td>
  ),

  /* Available to posts as <Figure />. See figure.tsx for why `img` is not. */
  Figure,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
