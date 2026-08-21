import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/content/projects";
import { Slab } from "@/components/ui/slab";
import { Tag } from "@/components/ui/tag";
import { Metric } from "@/components/ui/metric";
import { Rule } from "@/components/ui/rule";
import { ArrowRightIcon } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { projectJsonLd } from "@/lib/jsonld";

/** Every route is known at build time — nothing here is dynamic. */
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.name,
    description: project.hook,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.name} — Vinh Tran`,
      description: project.hook,
      type: "article",
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      <JsonLd data={projectJsonLd(project)} />

      <main id="main">
        <article>
          {/* Hero */}
          <header className="border-b-4 border-rule px-5 pt-12 pb-12 md:px-8 md:pt-16 md:pb-16">
            <div className="mx-auto max-w-7xl">
              <Link
                href="/#work"
                className="inline-flex min-h-11 items-center gap-2 font-mono text-label uppercase text-muted transition-none hover:bg-on-ground hover:text-ground"
              >
                <ArrowRightIcon className="rotate-180" />
                All work
              </Link>

              <h1 className="mt-6 text-h1 uppercase">{project.name}</h1>
              <p className="mt-4 max-w-[52ch] text-lead text-balance">
                {project.tagline}
              </p>

              <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="font-mono text-label uppercase text-muted">
                    Period
                  </dt>
                  <dd className="mt-1">{project.period}</dd>
                </div>
                <div className="lg:col-span-2">
                  <dt className="font-mono text-label uppercase text-muted">
                    Stack
                  </dt>
                  <dd className="mt-2">
                    <ul className="flex flex-wrap gap-2">
                      {project.stack.map((tech) => (
                        <li key={tech}>
                          <Tag>{tech}</Tag>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          </header>

          {/* Headline metrics */}
          <section
            aria-label="Headline figures"
            className="inverted border-b-4 border-rule"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y-2 divide-rule sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
              {project.headlineMetrics.map((metric) => (
                <div key={metric.unit} className="px-5 py-6 md:px-8 md:py-8">
                  <Metric metric={metric} />
                </div>
              ))}
            </div>
          </section>

          {/* Narrative */}
          <div className="px-5 py-14 md:px-8 md:py-20">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-12 md:gap-16">
                {project.sections.map((section, i) => (
                  <section key={section.heading}>
                    <Rule weight={2} />
                    <h2 className="mt-4 text-h3 uppercase">
                      <span
                        aria-hidden="true"
                        className="mr-4 font-mono text-label align-middle text-muted"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {section.heading}
                    </h2>
                    <div className="mt-5 flex max-w-[68ch] flex-col gap-4">
                      {section.body.map((para) => (
                        <p key={para.slice(0, 40)}>{para}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/*
                Links render only when a URL exists. The projects are still
                being finished, so the deep-dive stands alone until then.
              */}
              {project.links && Object.keys(project.links).length > 0 && (
                <Slab border={4} className="mt-14 p-5 md:p-8">
                  <h2 className="font-mono text-label uppercase text-muted">
                    Links
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-4">
                    {Object.entries(project.links).map(([key, href]) => (
                      <li key={key}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 border-2 border-rule px-4 font-mono text-label uppercase transition-none hover:bg-on-ground hover:text-ground"
                        >
                          {key}
                          <span className="sr-only"> (opens in new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </Slab>
              )}
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
