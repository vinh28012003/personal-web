"use client";

import { useMediaQuery } from "@/lib/use-client-value";
import { Button } from "@/components/ui/button";
import { DownloadIcon, ArrowRightIcon } from "@/components/icons";

interface ResumeViewerProps {
  src: string;
  /** Shown in the mobile card so the page still says something useful. */
  summary: readonly string[];
}

/**
 * iOS Safari and Chrome on Android routinely refuse to render an embedded
 * PDF inline — you get a blank grey box, or a silent download. So the embed
 * is only mounted where it actually works, and small screens get a real
 * card with the download and open-in-new-tab actions instead of a broken
 * viewport.
 *
 * The decision is made from `matchMedia`, not a user-agent sniff: what
 * matters is available width, and UA strings lie.
 */
export function ResumeViewer({ src, summary }: ResumeViewerProps) {
  // Live: re-evaluates on resize and orientation change. Reading this once
  // at hydration left a rotated tablet stuck on the mobile card forever.
  // False on the server and first paint, so hydration cannot mismatch.
  const canEmbed = useMediaQuery("(min-width: 768px)");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <Button href={src} download variant="primary" size="lg">
          <DownloadIcon />
          Download PDF
        </Button>
        <Button href={src} variant="secondary" size="lg">
          Open in new tab
          <ArrowRightIcon />
        </Button>
      </div>

      {canEmbed ? (
        <object
          data={`${src}#view=FitH`}
          type="application/pdf"
          aria-label="Resume of Vinh Tran"
          className="h-[calc(100dvh-18rem)] min-h-125 w-full border-4 border-rule bg-surface"
        >
          {/* Rendered when the browser has no PDF plug-in at all. */}
          <p className="p-6">
            Your browser cannot display PDFs inline.{" "}
            <a
              href={src}
              download
              className="text-accent-text underline underline-offset-4"
            >
              Download the resume
            </a>{" "}
            instead.
          </p>
        </object>
      ) : (
        <div className="border-4 border-rule bg-surface p-5 md:p-8">
          <p className="font-mono text-label uppercase text-muted">Summary</p>
          <ul className="mt-4 flex flex-col gap-3">
            {summary.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true" className="font-mono text-accent-text">
                  ·
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t-2 border-rule pt-4 text-sm text-muted">
            Inline PDF preview is unreliable on mobile browsers, so it is not
            shown here. Use the buttons above to read the full document.
          </p>
        </div>
      )}
    </div>
  );
}
