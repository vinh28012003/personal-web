/**
 * Structured data.
 *
 * The payload is built from our own typed content — never from user input —
 * so the serialised object is compile-time shaped. `<` is still escaped to
 * close off the classic `</script>` break-out.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
