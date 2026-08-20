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

        <p
          className="intro-fade mt-8 max-w-[38ch] text-lead text-balance md:max-w-[52ch]"
          style={{ "--intro-i": 1 } as React.CSSProperties}
        >
          {profile.intro}
        </p>

        <div
          className="intro-fade mt-10 flex flex-wrap items-center gap-4"
          style={{ "--intro-i": 2 } as React.CSSProperties}
        >
          <Button href={profile.resumePath} download variant="primary" size="lg">
            <DownloadIcon />
            Résumé
          </Button>
          <Button href="/#work" variant="secondary" size="lg">
            See the work
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}
