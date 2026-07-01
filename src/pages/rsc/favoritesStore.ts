// In-memory, server-only store of "favorite" country codes. It lives only on
// the server (never shipped to the browser) and is mutated by a Server Action.
// Resets on server restart — good enough to demonstrate server-owned state.
const favorites = new Set<string>();

export function listFavorites(): string[] {
  return [...favorites];
}

export function toggleFavorite(code: string): string[] {
  if (favorites.has(code)) favorites.delete(code);
  else favorites.add(code);
  return [...favorites];
}
