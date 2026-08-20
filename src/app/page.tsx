import { SkipLink } from "@/components/layout/skip-link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/sections/hero";
import { ProofStrip } from "@/components/sections/proof-strip";
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
      <SkipLink />
      <SiteHeader />
      <main id="main">
        <Hero />
        <ProofStrip />
        <FeaturedProjects />
        <ExperienceTimeline />
        <SkillsMatrix />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
