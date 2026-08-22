import { profile } from "@/content/profile";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";

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
          Backend / Infrastructure · Purdue Computer Science
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
          --intro-i is 1, not 2. A strapline list used to sit between the
          name and these buttons and held that slot; .intro-fade delays are
          320ms + i * 70ms, so leaving the gap would stall the stagger for
          one empty beat on a step that no longer exists.
        */}
        <div
          className="intro-fade mt-10 flex flex-wrap items-center gap-4"
          style={{ "--intro-i": 1 } as React.CSSProperties}
        >
          {/*
            Goes to the preview page rather than downloading straight away.
            A recruiter can read it in the browser and decide, instead of
            being handed a file they then have to open. Downloading is the
            primary action on that page.

            The icon is an arrow, not a download glyph: this navigates.
          */}
          <Button href="/resume" variant="primary" size="lg">
            View resume
            <ArrowRightIcon />
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
