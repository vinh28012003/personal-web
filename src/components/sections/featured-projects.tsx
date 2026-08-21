import Link from "next/link";
import { projects } from "@/content/projects";
import { SectionHeader } from "@/components/ui/section-header";
import { Slab } from "@/components/ui/slab";
import { Tag } from "@/components/ui/tag";
import { Metric } from "@/components/ui/metric";
import { Reveal } from "@/components/ui/reveal";
import { ArrowRightIcon } from "@/components/icons";
import type { Project } from "@/content/types";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Slab
      as="article"
      border={4}
      surface
      shadow="slab"
      // `relative` anchors the stretched link below.
      className="slab-3d relative flex h-full flex-col p-5 md:p-8"
    >
      <p className="font-mono text-label uppercase text-muted">
        {String(index + 1).padStart(2, "0")} · {project.period}
      </p>

      <h3 className="mt-3 text-h3 uppercase">
        {/*
          The whole card is the hit area, but the accessible name is just the
          title — a stretched link rather than wrapping the card in an <a>,
          which would read the entire card contents as the link text.
        */}
        <Link
          href={`/work/${project.slug}`}
          className="after:absolute after:inset-0 after:content-[''] transition-none hover:bg-on-ground hover:text-ground"
        >
          {project.name}
        </Link>
      </h3>

      <p className="mt-3 max-w-[46ch] text-balance">{project.hook}</p>

      <Slab
        border={2}
        className="mt-6 grid grid-cols-1 divide-y-2 divide-rule sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0"
      >
        {project.headlineMetrics.map((metric) => (
          <div key={metric.unit} className="p-4">
            <Metric metric={metric} size="sm" />
          </div>
        ))}
      </Slab>

      <ul className="mt-6 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li key={tech}>
            <Tag>{tech}</Tag>
          </li>
        ))}
      </ul>

      <p
        aria-hidden="true"
        className="mt-6 flex items-center gap-2 pt-2 font-mono text-label uppercase text-accent-text"
      >
        Read the write-up
        <ArrowRightIcon />
      </p>
    </Slab>
  );
}

export function FeaturedProjects() {
  return (
    <section className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader index="01" title="Projects" id="projects" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delayIndex={i} className="scene h-full">
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
