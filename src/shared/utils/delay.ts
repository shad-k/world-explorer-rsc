/** Resolves after `ms` milliseconds. Used to make async rendering observable. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
