import type { Metadata } from "next";
import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { ResumeViewer } from "@/components/resume/resume-viewer";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${profile.name}. ${profile.role}, ${profile.graduation}.`,
  alternates: { canonical: "/resume" },
};

/** Kept short on purpose: this stands in for the PDF on small screens. */
const SUMMARY = [
  `${profile.role} · ${profile.graduation}`,
  `Currently ${experience[0].role} at ${experience[0].org}`,
  "4 backend/infrastructure internships across Hanoi and West Lafayette",
  "Redis server in C++ serving 375K+ pipelined ops/sec",
  "CForge, a runtime configuration library published to npm and PyPI",
] as const;

export default function ResumePage() {
  return (
    <main id="main" className="px-5 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-label uppercase text-muted">Document</p>
        <h1 className="mt-4 text-h1 uppercase">Resume</h1>
        <p className="mt-4 max-w-[52ch] text-lead text-balance">
          Read it here, or take the PDF. Both are the same document.
        </p>

        <div className="mt-10">
          <ResumeViewer src={profile.resumePath} summary={SUMMARY} />
        </div>
      </div>
    </main>
  );
}
