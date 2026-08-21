import { experience } from "@/content/experience";
import { SectionHeader } from "@/components/ui/section-header";
import { Tag } from "@/components/ui/tag";
import { Metric } from "@/components/ui/metric";
import { Reveal } from "@/components/ui/reveal";
import type { Experience } from "@/content/types";

/**
 * Returns the entry's inner content only. The <li> itself is rendered by
 * Reveal (`as="li"`) so that no wrapper div ends up as a direct child of
 * the <ol>, which would be invalid HTML.
 */
function EntryBody({ item }: { item: Experience }) {
  return (
    <>
      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
        <h3 className="text-h3">
          {item.role}
          <span className="text-muted"> · </span>
          <span className="text-accent-text">{item.org}</span>
        </h3>

        <p className="shrink-0 font-mono text-label uppercase text-muted">
          <time dateTime={item.startISO}>{item.start}</time>
          {" to "}
          {item.endISO ? (
            <time dateTime={item.endISO}>{item.end}</time>
          ) : (
            <span>{item.end}</span>
          )}
        </p>
      </div>

      <p className="mt-1 font-mono text-label uppercase text-muted">
        {item.location}
      </p>

      <ul className="mt-5 flex flex-col gap-5">
        {item.bullets.map((bullet) => (
          <li
            key={bullet.text}
            className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6"
          >
            {/*
              min-w, not a fixed w: the delta form ("300ms -> 165ms") is wider
              than 11rem, and whitespace-nowrap pushed it straight through the
              right border when the width was fixed.
            */}
            {bullet.metric && (
              <div className="shrink-0 border-2 border-rule px-3 py-2 md:min-w-44">
                <Metric metric={bullet.metric} size="sm" />
              </div>
            )}
            <p className="max-w-[68ch] flex-1">{bullet.text}</p>
          </li>
        ))}
      </ul>

      <ul className="mt-5 flex flex-wrap gap-2">
        {item.stack.map((tech) => (
          <li key={tech}>
            <Tag>{tech}</Tag>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ExperienceTimeline() {
  return (
    <section className="border-t-4 border-rule px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader index="02" title="Experiences" id="experiences" />

        {/* An ordered list, because the order carries meaning. */}
        <ol className="flex flex-col gap-14 md:gap-20">
          {experience.map((item, i) => (
            <Reveal
              key={item.org}
              as="li"
              delayIndex={i}
              // The left rail is a border, not an SVG.
              className="border-l-4 border-rule pl-5 md:pl-8"
            >
              <EntryBody item={item} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
