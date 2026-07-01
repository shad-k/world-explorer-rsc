// Emits a feature's resolved data inline, right next to its HTML, as it streams.
// Rendered identically on the server and during hydration (same JSON), so there
// is no hydration mismatch; on the client it feeds the streaming channel so the
// boundary hydrates without a second fetch.
export function StreamDataScript({
  name,
  data,
}: {
  name: string;
  data: unknown;
}) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(window.__WE_DATA__=window.__WE_DATA__||[]).push([${JSON.stringify(
          name,
        )},${json}])`,
      }}
    />
  );
}
