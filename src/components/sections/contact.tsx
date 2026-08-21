import { profile } from "@/content/profile";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { CopyEmail } from "@/components/ui/copy-email";
import { GithubIcon, LinkedinIcon, DownloadIcon } from "@/components/icons";

/**
 * Terminal block, inverted. Everything a recruiter needs to act is here and
 * nothing else is.
 */
export function Contact() {
  return (
    <section
      id="contact-section"
      className="inverted border-t-4 border-rule px-5 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeader index="04" title="Contact" id="contact" />

        <p className="max-w-[52ch] text-lead text-balance">
          I am looking for backend and infrastructure roles. The fastest way to
          reach me is email.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <CopyEmail email={profile.email} />

          <div className="flex flex-wrap gap-4">
            <Button href={profile.github} variant="secondary">
              <GithubIcon />
              GitHub
            </Button>
            <Button href={profile.linkedin} variant="secondary">
              <LinkedinIcon />
              LinkedIn
            </Button>
            <Button href={profile.resumePath} download variant="primary">
              <DownloadIcon />
              Resume
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
