import { Hero } from "@/components/sections/hero";
import { IntroStrip } from "@/components/sections/intro-strip";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { SkillsMatrix } from "@/components/sections/skills-matrix";
import { Contact } from "@/components/sections/contact";
import { JsonLd } from "@/components/seo/json-ld";
import { personJsonLd } from "@/lib/jsonld";

export default function Home() {
  return (
    <>
      <JsonLd data={personJsonLd()} />
      <main id="main">
        <Hero />
        <IntroStrip />
        <FeaturedProjects />
        <ExperienceTimeline />
        <SkillsMatrix />
        <Contact />
      </main>
    </>
  );
}
