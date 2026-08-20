/**
 * The 6-to-9-second beat of the skim. Three numbers, no prose, no links —
 * it exists to make "backend engineer" concrete before the reader decides
 * whether to keep going.
 */
const PROOF = [
  {
    figure: "375K+",
    label: "pipelined ops/sec",
    plain: "375,000 or more pipelined operations per second.",
  },
  {
    figure: "1,000+",
    label: "concurrent SSE clients",
    plain: "Over 1,000 concurrent server-sent-event clients.",
  },
  {
    figure: "10,219",
    label: "records verified",
    plain: "10,219 production job records verified.",
  },
] as const;

export function ProofStrip() {
  return (
    <section
      aria-label="Selected figures"
      className="inverted border-b-4 border-rule"
    >
      <ul className="mx-auto grid max-w-7xl grid-cols-1 divide-y-2 divide-rule sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
        {PROOF.map((item) => (
          <li key={item.label} className="px-5 py-6 md:px-8 md:py-8">
            <span className="sr-only">{item.plain}</span>
            <span
              aria-hidden="true"
              className="block font-mono text-2xl font-bold md:text-3xl"
            >
              {item.figure}
            </span>
            <span
              aria-hidden="true"
              className="mt-1 block font-mono text-[0.6875rem] tracking-[0.1em] uppercase opacity-80"
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
