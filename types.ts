export const RenderMode = {
  STREAM: "stream",
  CSR: "csr",
  SSR: "ssr",
  RSC: "rsc",
} as const;

export type RenderMode = (typeof RenderMode)[keyof typeof RenderMode];

export type RenderOptions = {
  htmlStart?: string;
  htmlEnd?: string;
  mode?: RenderMode;
};

declare global {
  interface Window {
    __RENDER_MODE__: RenderMode;
  }
}
