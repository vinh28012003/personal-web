import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, publishedPosts } from "@/content/posts";
import { JsonLd } from "@/components/seo/json-ld";
import { postJsonLd } from "@/lib/jsonld";

/**
 * True, unlike work/[slug]'s false, and the difference is deliberate.
 *
 * With dynamicParams = false an unmatched slug is a ROUTING-level 404: the
 * segment is never entered, notFound() is never called, and app/blog/
 * not-found.tsx never runs -- so a bad post URL renders the portfolio's
 * brutalist 404 inside the blog's URL space. It also made the notFound()
 * call below dead code.
 *
 * True lets the page render, miss, and call notFound(), which the blog's own
 * boundary catches. Known posts are still prerendered by generateStaticParams;
 * the only cost is that an unknown slug does a little server work before
 * returning its 404.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    // Without this the page silently inherits the root canonical of "/".
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} · Vinh Tran`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated,
      tags: [...post.tags],
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  /*
   * The bundler compiles this at build time as an ordinary module import;
   * nothing parses MDX at runtime. The .mdx extension is required.
   * @types/mdx supplies `declare module "*.mdx"`, so `default` is typed.
   */
  const { default: Body } = await import(`@/content/posts/${slug}.mdx`);

  return (
    /* No <main> here: app/blog/layout.tsx owns the landmark. See the note
       there for why the blog inverts the portfolio's convention. */
    <>
      <JsonLd data={postJsonLd(post)} />

      <article className="mx-auto max-w-3xl px-5 py-16">
        <header>
          <p className="text-post-meta uppercase tracking-[0.06em] text-muted">
            <time dateTime={post.published}>
              {new Date(`${post.published}T00:00:00Z`).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" },
              )}
            </time>
          </p>
          <h1 className="mt-4 text-post-title">{post.title}</h1>
          <p className="mt-5 text-post-lede text-muted">{post.excerpt}</p>
        </header>

        <div className="post-prose mt-12 flex flex-col gap-5">
          <Body />
        </div>
      </article>
    </>
  );
}
