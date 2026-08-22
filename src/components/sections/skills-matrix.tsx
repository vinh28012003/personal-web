import { skills } from "@/content/skills";
import { SectionHeader } from "@/components/ui/section-header";

/**
 * A definition list, because that is what this is: a term and the things
 * under it. Emphasis comes from the label column, never from colour.
 *
 * Items are plain text in an aligned grid, not bordered chips. Forty chips
 * meant forty competing rectangles, and the borders read louder than the
 * words inside them; the group rules already carry the structure. Column
 * alignment does the separating instead, which is what lets the eye scan
 * down rather than hunt across a ragged wrap.
 *
 * Mono is kept for the technical register and because it makes the columns
 * line up, but the uppercase and the 0.1em tracking are gone: at 11px they
 * destroyed word shape, so every name had to be read letter by letter.
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
                {/*
                  gap-x is wide enough that the columns read as columns
                  without a rule between them. Two columns at 375px keeps
                  the longest name ("GitHub Actions") on one line.
                */}
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
                  {group.items.map((item) => (
                    <li key={item} className="font-mono text-sm leading-snug">
                      {item}
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
