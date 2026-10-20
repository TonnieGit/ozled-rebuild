/**
 * JSON-LD script tag (SPEC §8.4). Escapes "<" so content can't close the script,
 * the cause of the live site's unparseable JSON-LD (raw control characters / HTML).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
