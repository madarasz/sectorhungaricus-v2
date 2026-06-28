type JsonLdData = Record<string, unknown> | Record<string, unknown>[]

// Renders a schema.org JSON-LD <script>. Escapes '<' so embedded content can't break out of the tag.
export default function JsonLd({ data }: { data: JsonLdData }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
