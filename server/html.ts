import type { ClientAssets } from "./assets";

// Builds the HTML document that wraps a mode's rendered output. The document is
// split around the #root content so that:
//   - CSR/SSR can send it in one piece
//   - Streaming SSR can flush `start`, pipe React's stream, then write `end`.
//
// A marker is used so that Vite's dev HTML transform (which injects the React
// Refresh preamble and @vite/client into <head>) runs over the whole document
// before we split it.

const ROOT_MARKER = "<!--app-root-->";

export interface DocumentParts {
  start: string;
  end: string;
}

export interface BuildDocumentOptions {
  mode: string;
  assets: ClientAssets;
  /** HTML injected just before the client entry script (e.g. serialized data). */
  tailHtml?: string;
  /** Transforms the full HTML (dev: Vite preamble injection; prod: identity). */
  transformHtml: (html: string) => Promise<string>;
}

export async function buildDocument({
  mode,
  assets,
  tailHtml = "",
  transformHtml,
}: BuildDocumentOptions): Promise<DocumentParts> {
  const styleTags = assets.styles
    .map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join("\n    ");

  const scriptTags = assets.scripts
    .map((src) => `<script type="module" src="${src}"></script>`)
    .join("\n    ");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>World Explorer · ${mode.toUpperCase()}</title>
    ${styleTags}
  </head>
  <body class="bg-slate-900">
    <div id="root">${ROOT_MARKER}</div>
    ${tailHtml}
    ${scriptTags}
  </body>
</html>`;

  const transformed = await transformHtml(html);
  const [start, end] = transformed.split(ROOT_MARKER);
  return { start, end };
}

/** Serializes a value into a script that assigns it to a window global. */
export function serializeData(globalName: string, data: unknown): string {
  // JSON.stringify with </script> escaping to avoid breaking out of the tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script>window.${globalName} = ${json};</script>`;
}
