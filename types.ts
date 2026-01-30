export const Mode = {
  STREAM: "stream",
  CSR: "csr",
  SSR: "ssr",
} as const;

export type Mode = (typeof Mode)[keyof typeof Mode];

export type RenderOptions = {
  htmlStart?: string;
  htmlEnd?: string;
  mode?: Mode;
};
