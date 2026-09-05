import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, publishedPosts } from "@/content/posts";
import { JsonLd } from "@/components/seo/json-ld";
import { postJsonLd } from "@/lib/jsonld";

/** Unknown slugs are a real 404, not a runtime render. Same as work/[slug]. */
export const dynamicParams = false;

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
