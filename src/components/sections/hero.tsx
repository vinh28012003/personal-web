import { profile } from "@/content/profile";
import { Button } from "@/components/ui/button";
import { DownloadIcon, ArrowRightIcon } from "@/components/icons";

/**
 * The one signature element. Boldness is spent here so everything below can
 * stay quiet and tabular.
 *
 * The name is hard-broken into explicit lines rather than left to wrap —
 * at wdth 125 / weight 900 the full string overflows a 375px viewport.
 *
 * `intro-line` / `intro-fade` are inert until the inline boot script sets
 * html[data-intro="run"] before first paint, so the default render — no JS,
 * reduced motion, or a repeat visit — is the finished state.
 */
export function Hero() {
  return (
    <section className="border-b-4 border-rule px-5 pt-12 pb-14 md:px-8 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-7xl">
        <p
          className="intro-fade font-mono text-label uppercase text-muted"
          style={{ "--intro-i": 0 } as React.CSSProperties}
        >
          Backend / Infrastructure · Purdue CS
        </p>

        <h1
          className="text-extruded mt-6 text-hero uppercase"
          style={{ fontVariationSettings: '"wght" 900, "wdth" 125' }}
        >
          {profile.heroLines.map((line, i) => (
            <span
              key={line}
              className="intro-line block"
              style={{ "--intro-i": i } as React.CSSProperties}
            >
              {line}
            </span>
          ))}
        </h1>

        {/*
          Set in Archivo rather than mono: the kicker above the name is
          already mono, uppercase and dot-separated, so matching it here
          would give the hero two competing straplines. Heavier weight and
          a larger size make this the statement and that the label.

          Separators are accent-coloured and aria-hidden, so a screen
          reader gets four list items rather than "Idea to product dot
          Simple but scalable dot".
        */}
        <ul
          className="intro-fade mt-8 flex flex-wrap items-center gap-x-3 gap-y-2"
          style={{ "--intro-i": 1 } as React.CSSProperties}
        >
          {profile.strapline.map((phrase, i) => (
            <li key={phrase} className="flex items-center gap-x-3">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  // Hidden once the list stacks: as a separator it only makes
                  // sense between items on one line. Stacked, it turns into a
                  // bullet on every phrase except the first, which left that
                  // one hanging out of alignment.
                  className="hidden text-accent-text sm:inline"
                >
                  &middot;
                </span>
              )}
              <span className="font-display text-base font-bold uppercase tracking-[0.06em] md:text-lg">
                {phrase}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="intro-fade mt-10 flex flex-wrap items-center gap-4"
          style={{ "--intro-i": 2 } as React.CSSProperties}
        >
          <Button
            href={profile.resumePath}
            download
            variant="primary"
            size="lg"
          >
            <DownloadIcon />
            Résumé
          </Button>
          <Button href="/#projects" variant="secondary" size="lg">
            See the projects
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}
