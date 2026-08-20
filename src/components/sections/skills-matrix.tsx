import { skills } from "@/content/skills";
import { SectionHeader } from "@/components/ui/section-header";
import { Tag } from "@/components/ui/tag";

/**
 * A definition list, because that is what this is: a term and the things
 * under it. Emphasis comes from the label column, never from colour.
 */
export function SkillsMatrix() {
  return (
    <section className="border-t-4 border-rule px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader index="03" title="Toolkit" id="toolkit" />

        <dl className="flex flex-col">
          {skills.map((group) => (
            <div
              key={group.label}
              className="grid grid-cols-1 gap-3 border-t-2 border-rule py-6 md:grid-cols-[14rem_1fr] md:gap-8"
            >
              <dt className="font-mono text-label uppercase text-muted">
                {group.label}
              </dt>
              <dd>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Tag>{item}</Tag>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
