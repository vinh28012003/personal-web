import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import type { Project } from "@/content/types";
import { SITE_URL as BASE } from "@/lib/site";

/** Person schema for the home page. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: BASE,
    email: `mailto:${profile.email}`,
    jobTitle: profile.role,
    alumniOf: { "@type": "CollegeOrUniversity", name: profile.school },
    sameAs: [profile.github, profile.linkedin],
    worksFor: { "@type": "Organization", name: experience[0].org },
    knowsAbout: [
      "Distributed systems",
      "Backend engineering",
      "Infrastructure",
      "Redis",
      "Kafka",
      "PostgreSQL",
      "Kubernetes",
    ],
  };
}

/** SoftwareSourceCode schema for a project deep-dive. */
export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.hook,
    url: `${BASE}/work/${project.slug}`,
    programmingLanguage: project.stack,
    author: { "@type": "Person", name: profile.name, url: BASE },
    ...(project.links?.github && { codeRepository: project.links.github }),
  };
}
