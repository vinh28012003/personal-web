import Image from "next/image";

/**
 * The only way to put an image in a post.
 *
 * `img` is deliberately NOT mapped in mdx-components.tsx, so the markdown
 * ![]() form does nothing. That is the original content ADR's accessibility
 * argument relocated: it used to be Metric.plain, a required field so a
 * metric could not ship without its screen-reader sentence. Here it is these
 * props. alt, width and height are required, so an image physically cannot
 * ship without them, and next/image needs the dimensions anyway.
 */
export function Figure({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}) {
  return (
    <figure className="my-4">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full rounded-post border border-rule"
      />
      {caption && (
        <figcaption className="mt-3 text-post-small text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
