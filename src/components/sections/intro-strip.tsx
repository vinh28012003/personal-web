import { profile } from "@/content/profile";
import { experience } from "@/content/experience";

/**
 * The band directly under the hero.
 *
 * This used to carry project metrics — 375K ops/sec, 1,000+ SSE clients,
 * 10,219 records. Each figure had a unit but no subject, so a visitor who
 * had not yet read anything saw three orphan numbers: verified *what*?
 * And "SSE" is jargon a non-technical recruiter will not parse.
 *
 * Those numbers now live only in the Projects section, where the card names
 * the system they came from. This band answers the questions a recruiter is
 * actually holding in the first ten seconds: who is this, what do they do,
 * are they available.
 */
const FACTS = [
  {
    label: profile.school,
    value: "Class of 2025",
    detail: profile.graduation,
  },
  {
    label: "Backend & Infrastructure",
    value: "Systems focus",
    detail: "Distributed systems, data pipelines, caching, replication",
  },
  {
    label: "Open to SWE roles",
    value: "Available",
    detail: `Currently ${experience[0].role} at ${experience[0].org}`,
  },
] as const;

export function IntroStrip() {
  return (
    <section
      aria-label="At a glance"
      className="inverted border-b-4 border-rule"
    >
      <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y-2 divide-rule sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
        {FACTS.map((fact) => (
          <div key={fact.label} className="px-5 py-6 md:px-8 md:py-8">
            <dt className="font-mono text-[0.6875rem] tracking-[0.14em] uppercase text-muted">
              {fact.value}
            </dt>
            <dd className="mt-2 text-h3 uppercase">{fact.label}</dd>
            <dd className="mt-2 max-w-[34ch] text-sm text-muted">
              {fact.detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
