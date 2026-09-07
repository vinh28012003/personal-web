import Link from "next/link";
import type { CSSProperties } from "react";
import type { ScenePanel } from "@/content/scene-panels";
import { formatPostDate } from "@/lib/dates";

/**
 * One pane of glass on the arc.
 *
 * The panel carries only its index. Its position in the round is
 * rotateY(i * step) translateZ(radius), placed once and never touched again;
 * only the rail rotates. So there is no per-panel JavaScript and the
 * geometry stays correct at any panel count.
 *
 * It renders either kind of panel. The union is what keeps that a real
 * branch on `kind` rather than a truthiness check on an optional post field.
 *
 * <PostDate> is not reused here: it resolves colour through --muted, which
 * is the blog's warm-paper muted. Inside the arc everything is light on
 * deep, so the meta line uses the glass tokens. formatPostDate() IS reused,
 * because the UTC pinning in it is the part that matters.
 */
export function Panel({
  panel,
  index,
}: {
  panel: ScenePanel;
  index: number;
}) {
  return (
    <li className="arc-panel" style={{ "--i": index } as CSSProperties}>
      <article className="arc-face relative px-7 py-6">
        {panel.kind === "post" ? (
          <>
            <p className="arc-meta font-sans text-post-meta uppercase">
              {panel.placeholder ? (
                <span className="bg-accent px-2 py-1 text-accent-fg">
                  Placeholder
                </span>
              ) : (
                <time dateTime={panel.post.published}>
                  {formatPostDate(panel.post.published)}
                </time>
              )}
            </p>
            <h2 className="arc-title mt-3 text-post-h3">
              {/* Stretched link: the whole pane is the hit area, but the
                  accessible name is the title alone. layout.spec.ts's
                  touch-target check already excludes after:absolute.
                  A placeholder is inert -- a panel pointing at a URL that
                  404s would be worse than one plainly not a link. */}
              {panel.placeholder ? (
                panel.post.title
              ) : (
                <Link
                  href={`/blog/${panel.post.slug}`}
                  className="after:absolute after:inset-0 after:content-['']"
                >
                  {panel.post.title}
                </Link>
              )}
            </h2>
            <p className="arc-meta mt-3 line-clamp-3 text-post-small">
              {panel.post.excerpt}
            </p>
          </>
        ) : (
          <>
            <p className="arc-meta font-sans text-post-meta uppercase">
              {panel.href ? "Go" : "About"}
            </p>
            <h2 className="arc-title mt-3 text-post-h3">
              {panel.href ? (
                <Link
                  href={panel.href}
                  className="after:absolute after:inset-0 after:content-['']"
                >
                  {panel.title}
                </Link>
              ) : (
                panel.title
              )}
            </h2>
            <p className="arc-meta mt-3 line-clamp-3 text-post-small">
              {panel.body}
            </p>
          </>
        )}
      </article>
    </li>
  );
}
